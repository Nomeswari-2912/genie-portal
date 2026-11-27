const FILLER_PATTERN = /\b(um+|uh+|ah+|er+|erm+|hmm+|mm+|like|actually|basically|literally|honestly|you know|i mean|sort of|kind of)\b/gi;
const WORD_PATTERN = /[a-zA-Z']+/g;
const WINDOW_SECONDS = 0.05;
const LONG_PAUSE_SECONDS = 1.0;

const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
};

async function decodeBlob(blob) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !blob?.size) return null;
  const context = new AudioContextClass();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    return await context.decodeAudioData(arrayBuffer);
  } finally {
    context.close().catch(() => {});
  }
}

function envelopeStats(audioBuffer) {
  const channel = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.max(1, Math.floor(sampleRate * WINDOW_SECONDS));
  const rmsValues = [];
  for (let offset = 0; offset + windowSize <= channel.length; offset += windowSize) {
    let sum = 0;
    for (let i = offset; i < offset + windowSize; i += 1) sum += channel[i] * channel[i];
    rmsValues.push(Math.sqrt(sum / windowSize));
  }
  if (!rmsValues.length) return null;
  const threshold = Math.max(0.01, percentile(rmsValues, 0.65) * 0.6);
  const active = rmsValues.map((value) => value > threshold);

  let speechWindows = 0;
  let longPauses = 0;
  let silenceRun = 0;
  let seenSpeech = false;
  for (const isSpeech of active) {
    if (isSpeech) {
      speechWindows += 1;
      if (seenSpeech && silenceRun * WINDOW_SECONDS >= LONG_PAUSE_SECONDS) longPauses += 1;
      silenceRun = 0;
      seenSpeech = true;
    } else {
      silenceRun += 1;
    }
  }
  const speechSeconds = speechWindows * WINDOW_SECONDS;
  const totalSeconds = channel.length / sampleRate;
  return { speechSeconds, totalSeconds, longPauses, threshold };
}

function transcriptMetrics(transcript) {
  const text = String(transcript || "");
  const words = text.match(WORD_PATTERN) || [];
  const fillers = (text.match(FILLER_PATTERN) || []).length;
  let repeatedWords = 0;
  for (let i = 1; i < words.length; i += 1) {
    if (words[i].toLowerCase() === words[i - 1].toLowerCase()) repeatedWords += 1;
  }
  const wordCount = words.length;
  const fillerRate = wordCount ? fillers / wordCount : 0;
  const repeatRate = wordCount ? repeatedWords / wordCount : 0;
  const clarity = Math.max(0, Math.min(100, Math.round(
    100 - fillerRate * 350 - repeatRate * 250 - (fillers > 8 ? 10 : 0),
  )));
  return { wordCount, fillers, repeatedWords, fillerRate, repeatRate, clarity };
}

function wpmScore(wpm) {
  if (!Number.isFinite(wpm) || wpm <= 0) return 0;
  if (wpm >= 110 && wpm <= 160) return 100;
  if (wpm < 110) return Math.max(30, Math.round((wpm / 110) * 100));
  return Math.max(30, Math.round(100 - ((wpm - 160) / 160) * 100));
}

export async function analyzeAnswerSpeech({ audioBlob, transcript, listenSeconds = 0 }) {
  const text = transcriptMetrics(transcript);
  let envelope = null;
  if (audioBlob?.size) {
    try {
      const audioBuffer = await decodeBlob(audioBlob);
      if (audioBuffer) envelope = envelopeStats(audioBuffer);
    } catch (error) {
      console.warn("Could not analyze answer audio.", error);
    }
  }

  const speechSeconds = envelope?.speechSeconds
    ?? (listenSeconds > 0 ? listenSeconds : null);
  const wpm = speechSeconds && speechSeconds > 1 && text.wordCount
    ? Math.round(text.wordCount / (speechSeconds / 60))
    : null;
  const longPauses = envelope?.longPauses ?? null;

  let score = null;
  if (wpm !== null || text.wordCount > 0) {
    const parts = [];
    let weight = 0;
    parts.push([text.clarity, 0.5]);
    weight += 0.5;
    if (wpm !== null) {
      parts.push([wpmScore(wpm), 0.25]);
      weight += 0.25;
    }
    if (longPauses !== null) {
      parts.push([Math.max(30, 100 - longPauses * 15), 0.25]);
      weight += 0.25;
    }
    const total = parts.reduce((sum, [value, w]) => sum + value * w, 0);
    score = Math.round(total / (weight || 1));
  }

  return {
    audioAnalyzed: Boolean(envelope),
    wpm,
    fillerWords: text.fillers,
    longPauses,
    repeatedWords: text.repeatedWords,
    clarity: text.wordCount ? text.clarity : null,
    score,
    speechSeconds: speechSeconds !== null ? Math.round(speechSeconds * 10) / 10 : null,
    wordCount: text.wordCount,
  };
}
