import React, { useEffect, useRef, useState } from "react";
import { analyzeAnswerSpeech } from "../speechAnalysis.js";
import AnswerSuggestions from "./AnswerSuggestions.jsx";

const assessmentLabels = {
  correct: "Correct",
  partially_correct: "Partially correct",
  incorrect: "Incorrect",
  subjective: "Open-ended",
};
const spokenAssessments = {
  correct: "That answer is correct.",
  partially_correct: "That answer is partially correct.",
  incorrect: "That answer is incorrect.",
  subjective: "That was an open-ended answer with no single correct response.",
};

const speechLanguages = {
  en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT", pt: "pt-PT",
  ru: "ru-RU", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", hi: "hi-IN", te: "te-IN",
  ta: "ta-IN", kn: "kn-IN", ml: "ml-IN", bn: "bn-BD", mr: "mr-IN", gu: "gu-IN", pa: "pa-IN", ur: "ur-PK",
  fa: "fa-IR", ar: "ar-SA", tr: "tr-TR", nl: "nl-NL", pl: "pl-PL", uk: "uk-UA",
  ro: "ro-RO", cs: "cs-CZ", sk: "sk-SK", hu: "hu-HU", sv: "sv-SE", no: "nb-NO",
  da: "da-DK", fi: "fi-FI", el: "el-GR", he: "he-IL", th: "th-TH", vi: "vi-VN",
  id: "id-ID", ms: "ms-MY", tl: "fil-PH", sw: "sw-KE", am: "am-ET", ha: "ha-NG",
  yo: "yo-NG", ig: "ig-NG", zu: "zu-ZA", xh: "xh-ZA", af: "af-ZA", ca: "ca-ES",
  eu: "eu-ES", gl: "gl-ES", hr: "hr-HR", sr: "sr-RS", bg: "bg-BG", sq: "sq-AL",
  mk: "mk-MK", sl: "sl-SI", et: "et-EE", lv: "lv-LV", lt: "lt-LT", is: "is-IS",
  ga: "ga-IE", cy: "cy-GB", mt: "mt-MT", bs: "bs-BA", be: "be-BY", kk: "kk-KZ",
  uz: "uz-UZ", hy: "hy-AM", ka: "ka-GE", az: "az-AZ", ps: "ps-AF", ne: "ne-NP",
  si: "si-LK", my: "my-MM", km: "km-KH", lo: "lo-LA", mn: "mn-MN", jv: "jv-ID",
  su: "su-ID", eo: "eo", haw: "haw-US", sm: "sm-WS", fj: "fj-FJ", mg: "mg-MG",
  ny: "ny-MW", sn: "sn-ZW", st: "st-LS", tn: "tn-BW", ss: "ss-SZ", ti: "ti-ET",
  om: "om-ET", rw: "rw-RW", ln: "ln-CD", qu: "qu-PE", ay: "ay-BO",
};

export const interviewLanguages = [
  { code: "en", name: "English", flag: "🇺🇸" }, { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" }, { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" }, { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" }, { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" }, { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" }, { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" }, { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳" }, { code: "bn", name: "Bengali", flag: "🇧🇩" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" }, { code: "gu", name: "Gujarati", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" }, { code: "ur", name: "Urdu", flag: "🇵🇰" },
  { code: "fa", name: "Persian", flag: "🇮🇷" }, { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" }, { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" }, { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" }, { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "sk", name: "Slovak", flag: "🇸🇰" }, { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" }, { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "da", name: "Danish", flag: "🇩🇰" }, { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "el", name: "Greek", flag: "🇬🇷" }, { code: "he", name: "Hebrew", flag: "🇮🇱" },
  { code: "th", name: "Thai", flag: "🇹🇭" }, { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" }, { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "tl", name: "Filipino", flag: "🇵🇭" }, { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "am", name: "Amharic", flag: "🇪🇹" }, { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "yo", name: "Yoruba", flag: "🇳🇬" }, { code: "ig", name: "Igbo", flag: "🇳🇬" },
  { code: "zu", name: "Zulu", flag: "🇿🇦" }, { code: "xh", name: "Xhosa", flag: "🇿🇦" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" }, { code: "ca", name: "Catalan", flag: "🇪🇸" },
  { code: "eu", name: "Basque", flag: "🇪🇸" }, { code: "gl", name: "Galician", flag: "🇪🇸" },
  { code: "hr", name: "Croatian", flag: "🇭🇷" }, { code: "sr", name: "Serbian", flag: "🇷🇸" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" }, { code: "sq", name: "Albanian", flag: "🇦🇱" },
  { code: "mk", name: "Macedonian", flag: "🇲🇰" }, { code: "sl", name: "Slovenian", flag: "🇸🇮" },
  { code: "et", name: "Estonian", flag: "🇪🇪" }, { code: "lv", name: "Latvian", flag: "🇱🇻" },
  { code: "lt", name: "Lithuanian", flag: "🇱🇹" }, { code: "is", name: "Icelandic", flag: "🇮🇸" },
  { code: "ga", name: "Irish", flag: "🇮🇪" }, { code: "cy", name: "Welsh", flag: "🇬🇧" },
  { code: "mt", name: "Maltese", flag: "🇲🇹" }, { code: "bs", name: "Bosnian", flag: "🇧🇦" },
  { code: "be", name: "Belarusian", flag: "🇧🇾" }, { code: "kk", name: "Kazakh", flag: "🇰🇿" },
  { code: "uz", name: "Uzbek", flag: "🇺🇿" }, { code: "hy", name: "Armenian", flag: "🇦🇲" },
  { code: "ka", name: "Georgian", flag: "🇬🇪" }, { code: "az", name: "Azerbaijani", flag: "🇦🇿" },
  { code: "ps", name: "Pashto", flag: "🇦🇫" }, { code: "ne", name: "Nepali", flag: "🇳🇵" },
  { code: "si", name: "Sinhala", flag: "🇱🇰" }, { code: "my", name: "Burmese", flag: "🇲🇲" },
  { code: "km", name: "Khmer", flag: "🇰🇭" }, { code: "lo", name: "Lao", flag: "🇱🇦" },
  { code: "mn", name: "Mongolian", flag: "🇲🇳" }, { code: "jv", name: "Javanese", flag: "🇮🇩" },
  { code: "su", name: "Sundanese", flag: "🇮🇩" }, { code: "eo", name: "Esperanto", flag: "🌍" },
  { code: "haw", name: "Hawaiian", flag: "🇺🇸" }, { code: "sm", name: "Samoan", flag: "🇼🇸" },
  { code: "fj", name: "Fijian", flag: "🇫🇯" }, { code: "mg", name: "Malagasy", flag: "🇲🇬" },
  { code: "ny", name: "Chichewa", flag: "🇲🇼" }, { code: "sn", name: "Shona", flag: "🇿🇼" },
  { code: "st", name: "Sesotho", flag: "🇱🇸" }, { code: "tn", name: "Setswana", flag: "🇧🇼" },
  { code: "ss", name: "Swati", flag: "🇸🇿" }, { code: "ti", name: "Tigrinya", flag: "🇪🇹" },
  { code: "om", name: "Oromo", flag: "🇪🇹" }, { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
  { code: "ln", name: "Lingala", flag: "🇨🇩" }, { code: "qu", name: "Quechua", flag: "🇵🇪" },
  { code: "ay", name: "Aymara", flag: "🇧🇴" },
];

export const interviewRoleOptions = [
  "UI/UX Designer",
  "Software Developer",
  "Python Developer",
  "Java Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "AI/ML Engineer",
  "Database Administrator",
  "Cloud Engineer",
  "Cybersecurity Engineer",
];
const interviewTypeOptions = ["HR", "Technical", "Coding", "Behavioral", "Mixed", "Aptitude"];
const companyRoundOptions = ["Aptitude", "Technical", "HR", "Coding"];
const interviewCompanies = [
  "Deloitte", "Accenture", "TCS", "Infosys", "Wipro", "HCLTech", "Tech Mahindra",
  "Cognizant", "Capgemini", "IBM", "Oracle", "Google", "Microsoft", "Amazon", "Goldman Sachs",
];
const interviewDifficultyOptions = ["Easy", "Medium", "Hard"];
const interviewDurationOptions = [15, 30, 45, 60];
const interviewQuestionOptions = [5, 10, 15, 20];
const interviewModeOptions = [
  { value: "voice", label: "Voice" },
  { value: "video", label: "Video" },
  { value: "text", label: "Text" },
];

const defaultSetup = {
  type: "Technical",
  company: "",
  experience: "",
  difficulty: "Medium",
  duration: 30,
  questions: 10,
  language: "en",
  explanationLanguage: "",
  mode: "voice",
};

function loadSavedSetup() {
  try {
    const saved = JSON.parse(localStorage.getItem("genie-interview-setup") || "null");
    if (!saved || typeof saved !== "object") return { ...defaultSetup };
    return {
      type: interviewTypeOptions.includes(saved.type) ? saved.type : defaultSetup.type,
      company: typeof saved.company === "string" ? saved.company.trim().slice(0, 80) : defaultSetup.company,
      experience: ["Fresher", "Junior", "Mid-level", "Senior"].includes(saved.experience) ? saved.experience : defaultSetup.experience,
      difficulty: interviewDifficultyOptions.includes(saved.difficulty) ? saved.difficulty : defaultSetup.difficulty,
      duration: interviewDurationOptions.includes(Number(saved.duration)) ? Number(saved.duration) : defaultSetup.duration,
      questions: interviewQuestionOptions.includes(Number(saved.questions)) ? Number(saved.questions) : defaultSetup.questions,
      language: speechLanguages[saved.language] ? saved.language : defaultSetup.language,
      explanationLanguage: speechLanguages[saved.explanationLanguage] ? saved.explanationLanguage : defaultSetup.explanationLanguage,
      mode: interviewModeOptions.some((item) => item.value === saved.mode) ? saved.mode : defaultSetup.mode,
    };
  } catch {
    return { ...defaultSetup };
  }
}

function loadSavedResumeUpload() {
  try {
    const saved = JSON.parse(localStorage.getItem("genie-interview-resume") || "null");
    if (saved && typeof saved.text === "string" && saved.text.trim() && typeof saved.name === "string") {
      return { text: saved.text.slice(0, 6000), name: saved.name };
    }
  } catch {
    // Ignore corrupt saved resume data.
  }
  return { text: "", name: "" };
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function formatListeningDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function LiveInterview({ role, onRoleChange, onSpeakingChange, onListeningChange, onCandidateAnswer, onCandidateEvaluation, onInterviewStart, onInterviewComplete, onViewTranscript, onCameraChange, onHistoryChange, controlsRef, companyMode = false, preparationMode = false }) {
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [listening, setListening] = useState(false);
  const [listeningDuration, setListeningDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [answerCaptureComplete, setAnswerCaptureComplete] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    try { return localStorage.getItem("genie-voice-enabled") !== "0"; } catch { return true; }
  });
  const [autoMode, setAutoMode] = useState(() => {
    try { return localStorage.getItem("genie-hands-free") !== "0"; } catch { return true; }
  });
  const [setup, setSetup] = useState(loadSavedSetup);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [resumeUpload, setResumeUpload] = useState(loadSavedResumeUpload);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [prepLinks, setPrepLinks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("genie-resume-links") || "null");
      return saved && typeof saved === "object" ? saved : { linkedin: "", github: "", portfolio: "", additionalInfo: "", jobDescription: "" };
    } catch {
      return { linkedin: "", github: "", portfolio: "", additionalInfo: "", jobDescription: "" };
    }
  });
  const [hintFor, setHintFor] = useState("");
  const [hintBusy, setHintBusy] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [error, setError] = useState("");
  const [resumeContext, setResumeContext] = useState("");
  const recognitionRef = useRef(null);
  const recognitionTranscriptRef = useRef("");
  const recognitionInterimRef = useRef("");
  const continueListeningRef = useRef(false);
  const recognitionRestartRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioCaptureStartRef = useRef(null);
  const audioTranscriptionPendingRef = useRef(false);
  const networkRetryCountRef = useRef(0);
  const listeningStartedAtRef = useRef(null);
  const lastListenSecondsRef = useRef(0);
  const lastAnswerAudioRef = useRef(null);
  const speechContextRef = useRef(null);
  const speechAnalyserRef = useRef(null);
  const speechRafRef = useRef(null);
  const speechLevelRef = useRef(0);
  const speechActiveMsRef = useRef(0);
  const speechLastFrameRef = useRef(0);
  const waveCanvasRef = useRef(null);
  const [liveWpm, setLiveWpm] = useState(null);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const autoSubmitPendingRef = useRef(false);
  const lastSpeechAtRef = useRef(0);
  const hasSpeechRef = useRef(false);
  const speakingRef = useRef(false);
  const speechTokenRef = useRef(0);
  const reportSentRef = useRef(false);
  const candidateAnswerIndexRef = useRef(0);
  const historyRef = useRef([]);
  const endsAtRef = useRef(0);
  const startedAtRef = useRef(0);
  const pausedTotalRef = useRef(0);
  const pausedAtRef = useRef(null);
  const pausedRef = useRef(false);
  const micMutedRef = useRef(false);
  const resumeListeningRef = useRef(false);
  const preserveTranscriptRef = useRef(false);
  const skippedCountRef = useRef(0);
  const cameraStreamRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const resumeFileRef = useRef(null);
  const subtitleFallbackRef = useRef(null);
  startedRef.current = started;
  endedRef.current = ended;
  historyRef.current = history;
  pausedRef.current = paused;
  micMutedRef.current = micMuted;
  const updateListening = (active) => {
    if (active && listeningStartedAtRef.current === null) {
      listeningStartedAtRef.current = Date.now();
      setListeningDuration(0);
    } else if (!active && listeningStartedAtRef.current !== null) {
      const seconds = Math.floor((Date.now() - listeningStartedAtRef.current) / 1000);
      setListeningDuration(seconds);
      lastListenSecondsRef.current = seconds;
      listeningStartedAtRef.current = null;
    }
    setListening(active);
    onListeningChange(active);
  };
  const updateSetup = (key, value) => {
    setSetup((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    try {
      localStorage.setItem("genie-interview-setup", JSON.stringify(setup));
    } catch {
      // Storage may be unavailable; the in-memory config still applies.
    }
  }, [setup]);

  useEffect(() => {
    try {
      localStorage.setItem("genie-interview-resume", JSON.stringify(resumeUpload));
    } catch {
      // Storage may be unavailable; the in-memory resume still applies.
    }
  }, [resumeUpload]);

  useEffect(() => {
    try {
      localStorage.setItem("genie-voice-enabled", voiceEnabled ? "1" : "0");
      localStorage.setItem("genie-hands-free", autoMode ? "1" : "0");
    } catch {
      // Storage may be unavailable.
    }
  }, [voiceEnabled, autoMode]);

  const autoStartPendingRef = useRef(false);
  const autoStartFiredRef = useRef(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("genie-interview-autostart") === "1") {
        localStorage.removeItem("genie-interview-autostart");
        autoStartPendingRef.current = true;
      }
    } catch {
      // Storage may be unavailable.
    }
  }, []);

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setResumeBusy(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await fetch("/api/extract-resume", { method: "POST", body: formData });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.resume !== "string" || !result.resume.trim()) {
        throw new Error(result?.error || "Could not read that resume. Try a PDF, DOCX, or TXT file.");
      }
      setResumeUpload({ text: result.resume.trim().slice(0, 6000), name: result.fileName || file.name });
    } catch (uploadError) {
      setError(uploadError.message || "Could not upload the resume. Check that GenieBot is running and try again.");
    } finally {
      setResumeBusy(false);
    }
  };

  const getRecognitionTranscript = () => [
    recognitionTranscriptRef.current,
    recognitionInterimRef.current,
  ].filter(Boolean).join(" ").trim();
  const transcribeRecordedAudio = async (audioBlob) => {
    audioTranscriptionPendingRef.current = true;
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "interview-answer.webm");
      const response = await fetch("/api/transcribe-interview-audio", {
        method: "POST",
        body: formData,
      });
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("The interview transcription endpoint returned a non-JSON response.", parseError);
        throw new Error("The transcription service returned an invalid response. Try again or type your answer.");
      }
      if (!result || typeof result !== "object") {
        throw new Error("The transcription service returned an invalid response. Try again or type your answer.");
      }
      if (!response.ok) throw new Error(result.error || "Could not transcribe your answer. Try again or type it.");
      if (typeof result.transcript !== "string" || !result.transcript.trim()) {
        throw new Error("No speech was transcribed. Try speaking again or type your answer.");
      }
      setDraft((current) => current.trim() || result.transcript.trim().slice(0, 1600));
      setError("");
    } catch (transcriptionError) {
      console.error("Could not transcribe the recorded interview answer.", transcriptionError);
      setError(transcriptionError.message || "Could not transcribe your answer. Try again or type it.");
    } finally {
      audioTranscriptionPendingRef.current = false;
      setTranscribing(false);
    }
  };
  const startSpeechMeter = (stream) => {
    stopSpeechMeter();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const canvas = waveCanvasRef.current;
    if (!AudioContextClass || !canvas) return;
    try {
      const context = new AudioContextClass();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      speechContextRef.current = context;
      speechAnalyserRef.current = analyser;
      speechActiveMsRef.current = 0;
      speechLastFrameRef.current = performance.now();
      const data = new Uint8Array(analyser.fftSize);
      let lastWpmUpdate = 0;
      const draw = () => {
        speechRafRef.current = requestAnimationFrame(draw);
        const now = performance.now();
        const delta = now - speechLastFrameRef.current;
        speechLastFrameRef.current = now;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          const value = (data[i] - 128) / 128;
          sum += value * value;
        }
        const level = Math.sqrt(sum / data.length);
        speechLevelRef.current = level;
        if (level > 0.02) speechActiveMsRef.current += delta;

        const target = waveCanvasRef.current;
        if (target) {
          const width = target.clientWidth || 300;
          const height = target.clientHeight || 44;
          if (target.width !== width || target.height !== height) {
            target.width = width;
            target.height = height;
          }
          const ctx2d = target.getContext("2d");
          ctx2d.clearRect(0, 0, width, height);
          ctx2d.fillStyle = "#654ac2";
          const bars = 48;
          const barWidth = width / bars;
          for (let i = 0; i < bars; i += 1) {
            const index = Math.floor((i / bars) * data.length);
            const amplitude = Math.min(1, Math.abs(data[index] - 128) / 128 + level * 4);
            const barHeight = Math.max(2, amplitude * height * 0.9);
            ctx2d.fillRect(i * barWidth + 1, (height - barHeight) / 2, Math.max(1, barWidth - 2), barHeight);
          }
        }

        if (now - lastWpmUpdate > 500) {
          lastWpmUpdate = now;
          const words = (getRecognitionTranscript().match(/\S+/g) || []).length;
          const speechMinutes = speechActiveMsRef.current / 60000;
          setLiveWpm(speechMinutes > 0.03 && words > 0 ? Math.round(words / speechMinutes) : null);
        }
      };
      draw();
    } catch (meterError) {
      console.warn("Speech meter unavailable.", meterError);
    }
  };

  const stopSpeechMeter = () => {
    if (speechRafRef.current) cancelAnimationFrame(speechRafRef.current);
    speechRafRef.current = null;
    speechAnalyserRef.current = null;
    speechContextRef.current?.close().catch(() => {});
    speechContextRef.current = null;
    speechLevelRef.current = 0;
    setLiveWpm(null);
  };

  const startAudioRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return false;
    lastAnswerAudioRef.current = null;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!continueListeningRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return false;
    }

    const supportedMimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"]
      .find((mimeType) => window.MediaRecorder.isTypeSupported?.(mimeType));
    const recorder = new window.MediaRecorder(
      stream,
      supportedMimeType ? { mimeType: supportedMimeType } : undefined,
    );
    const chunks = [];
    audioChunksRef.current = chunks;
    mediaStreamRef.current = stream;
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunks.push(event.data);
    };
    recorder.onerror = (event) => {
      console.error("The browser could not record the interview audio.", event.error);
      setError("Backup audio recording failed. If your words do not appear, type your answer before sending.");
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      stopSpeechMeter();
      if (mediaRecorderRef.current === recorder) mediaRecorderRef.current = null;
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null;
      const audioBlob = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type || "audio/webm" });
      if (audioBlob.size) lastAnswerAudioRef.current = audioBlob;
      const transcript = getRecognitionTranscript();
      if (transcript) {
        setDraft((current) => current.trim() || transcript);
        setTranscribing(false);
      } else if (audioBlob.size) {
        void transcribeRecordedAudio(audioBlob);
      } else {
        audioTranscriptionPendingRef.current = false;
        setTranscribing(false);
        setError("No speech was captured. Try speaking again or type your answer.");
      }
    };
    recorder.start(1000);
    startSpeechMeter(stream);
    return true;
  };
  const stopAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      if (!getRecognitionTranscript()) setTranscribing(true);
      recorder.stop();
    } else if ((recorder || audioCaptureStartRef.current) && !getRecognitionTranscript()) {
      setTranscribing(true);
    } else if (!audioTranscriptionPendingRef.current && !getRecognitionTranscript()) {
      setTranscribing(false);
      setError("No transcript was captured. Allow microphone access, try speaking again, or type your answer.");
    }
  };
  const discardAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      recorder.onstop = null;
      recorder.stop();
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    audioChunksRef.current = [];
    stopSpeechMeter();
  };

  useEffect(() => {
    if (!listening) return undefined;
    const timer = window.setInterval(() => {
      if (listeningStartedAtRef.current !== null) {
        setListeningDuration(Math.floor((Date.now() - listeningStartedAtRef.current) / 1000));
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [listening]);

  useEffect(() => () => {
    continueListeningRef.current = false;
    window.clearTimeout(recognitionRestartRef.current);
    recognitionRef.current?.stop();
    discardAudioRecording();
    window.speechSynthesis?.cancel();
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    window.clearTimeout(subtitleFallbackRef.current);
    stopSpeechMeter();
    onSpeakingChange(false);
    onListeningChange(false);
  }, [onListeningChange, onSpeakingChange]);

  const speak = (text, onComplete, lang) => {
    const token = ++speechTokenRef.current;
    const finish = () => {
      if (token !== speechTokenRef.current) return;
      speakingRef.current = false;
      setSubtitle("");
      window.clearTimeout(subtitleFallbackRef.current);
      onSpeakingChange(false);
      onComplete?.();
    };
    setSubtitle("");
    if (setup.mode === "text" || !voiceEnabled || !window.speechSynthesis) {
      finish();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const speakLang = lang || setup.language;
    utterance.lang = speechLanguages[speakLang] || "en-US";
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang === utterance.lang) ||
      voices.find((item) => item.lang?.toLowerCase().startsWith(speakLang));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => {
      onSpeakingChange(true);
      window.clearTimeout(subtitleFallbackRef.current);
      subtitleFallbackRef.current = window.setTimeout(() => {
        setSubtitle((current) => current || text);
      }, 1500);
    };
    utterance.onboundary = (event) => {
      if (typeof event.charIndex === "number" && event.charIndex > 0) {
        setSubtitle(text.slice(0, event.charIndex).trimEnd());
      }
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    speakingRef.current = true;
    window.speechSynthesis.speak(utterance);
  };

  const readResumeContext = () => {
    let resume = {};
    try {
      const savedResume = localStorage.getItem("genie-resume-details");
      if (savedResume) {
        const parsed = JSON.parse(savedResume);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Saved resume details have an invalid format.");
        }
        resume = parsed;
      }
    } catch (readError) {
      console.error("Could not read saved resume details for the interview.", readError);
      throw new Error("Could not read your saved resume. Open Resume Builder, check your saved details, and try again.");
    }

    let savedSkills = "";
    try {
      savedSkills = localStorage.getItem("genie-resume-skills") || "";
    } catch (readError) {
      console.error("Could not read saved resume skills for the interview.", readError);
      throw new Error("Could not read your saved skills. Check browser storage and try again.");
    }
    return [
      ["Professional title", resume.role],
      ["Profile", resume.summary],
      ["Skills", [resume.skills, savedSkills].filter(Boolean).join(", ")],
      ["Experience", resume.experience],
      ["Internships", resume.internships],
      ["Education", resume.education],
      ["Certifications", resume.certifications],
    ].filter(([, value]) => typeof value === "string" && value.trim())
      .map(([label, value]) => `${label}: ${value.trim()}`)
      .join("\n")
      .slice(0, 6000);
  };

  const getInterviewerReply = async (turns, resumeDetails, extra = {}) => {
    let response;
    try {
      response = await fetch("/api/interview-turn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, history: turns, resume: resumeDetails, config: setup, ...extra }),
      });
    } catch (requestError) {
      console.error("Could not reach the live interview endpoint.", requestError);
      throw new Error("Could not reach the live interviewer. Check that GenieBot is running and try again.");
    }

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error("The live interview endpoint returned a non-JSON response.", parseError);
      if (response.status === 404) {
        throw new Error("The live interviewer endpoint is unavailable. Restart GenieBot from the project folder and reload this page.");
      }
      throw new Error("The live interviewer returned an empty or invalid response. Restart GenieBot and try again.");
    }

    if (!response.ok) throw new Error(result.error || "The AI interviewer could not respond. Please try again.");
    if (typeof result.reply !== "string" || !result.reply.trim()) {
      throw new Error("The AI interviewer returned an empty reply. Please try again.");
    }
    return result;
  };

  const startInterview = async () => {
    setBusy(true);
    setError("");
    setEnded(false);
    endedRef.current = false;
    startedRef.current = false;
    continueListeningRef.current = false;
    setHistory([]);
    setStarted(false);
    setDraft("");
    setAnswerCaptureComplete(false);
    setTranscribing(false);
    reportSentRef.current = false;
    candidateAnswerIndexRef.current = 0;
    skippedCountRef.current = 0;
    endsAtRef.current = Date.now() + setup.duration * 60000;
    startedAtRef.current = Date.now();
    pausedTotalRef.current = 0;
    pausedAtRef.current = null;
    setSecondsLeft(setup.duration * 60);
    setElapsed(0);
    setPaused(false);
    pausedRef.current = false;
    setMicMuted(false);
    micMutedRef.current = false;
    setSubtitle("");
    resumeListeningRef.current = false;
    preserveTranscriptRef.current = false;
    onInterviewStart();
    if (setup.mode === "video") void toggleCamera();
    try {
      const resumeDetails = resumeUpload.text.trim() ? resumeUpload.text : readResumeContext();
      setResumeContext(resumeDetails);
      const result = await getInterviewerReply([], resumeDetails);
      const firstTurn = { speaker: "interviewer", text: result.reply.trim(), at: Date.now() };
      setHistory([firstTurn]);
      setStarted(true);
      startedRef.current = true;
      speak(result.reply.trim(), () => {
        if (!micMutedRef.current && !pausedRef.current) toggleListening(true);
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (autoStartPendingRef.current && !autoStartFiredRef.current && !busy) {
      autoStartFiredRef.current = true;
      void startInterview();
    }
  });

  const submitAnswer = async (answer) => {
    if (busy || ended || paused || listening || transcribing) return;
    if (!answer.trim()) {
      setError("No answer transcript was captured. Type your answer or start speaking and try again.");
      return;
    }
    setBusy(true);
    setError("");
    preserveTranscriptRef.current = false;
    try {
      const candidateTurnIndex = candidateAnswerIndexRef.current;
      const candidateTurn = { speaker: "candidate", text: answer, at: Date.now() };
      const turns = [...history, candidateTurn];
      const speechPromise = setup.mode === "text"
        ? Promise.resolve(null)
        : analyzeAnswerSpeech({
          audioBlob: lastAnswerAudioRef.current
            || (audioChunksRef.current.length
              ? new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" })
              : null),
          transcript: answer,
          listenSeconds: lastListenSecondsRef.current,
        });
      lastAnswerAudioRef.current = null;
      const [result, speech] = await Promise.all([
        getInterviewerReply(turns, resumeContext),
        speechPromise,
      ]);
      if (speech && (speech.audioAnalyzed || speech.wordCount > 0)) candidateTurn.speech = speech;
      if (!result.evaluation?.scores ||
        typeof result.evaluation.feedback !== "string" ||
        !assessmentLabels[result.evaluation.assessment]) {
        throw new Error("Genie could not evaluate that answer. Please try again.");
      }
      candidateTurn.evaluation = result.evaluation;
      candidateAnswerIndexRef.current += 1;
      onCandidateAnswer(answer, candidateTurnIndex);
      onCandidateEvaluation(candidateTurnIndex, result.evaluation);
      const nextHistory = [...turns, { speaker: "interviewer", text: result.reply.trim(), at: Date.now() }];
      setHistory(nextHistory);
      setDraft("");
      setAnswerCaptureComplete(false);
      const answeredCount = nextHistory.filter((turn) => turn.speaker === "candidate").length;
      const assessmentSpeech = setup.language === "en" ? `${spokenAssessments[result.evaluation.assessment]} ` : "";
      const afterSpeech = () => {
        if (answeredCount >= setup.questions || Date.now() >= endsAtRef.current) {
          finishInterview(nextHistory);
        } else if (!micMutedRef.current && !pausedRef.current) {
          toggleListening(true);
        }
      };
      const mixedExplanations = setup.explanationLanguage && setup.explanationLanguage !== setup.language;
      if (mixedExplanations) {
        speak(`${assessmentSpeech}${result.evaluation.feedback}`, () => {
          speak(result.reply.trim(), afterSpeech);
        }, setup.explanationLanguage);
      } else {
        speak(`${assessmentSpeech}${result.evaluation.feedback} ${result.reply.trim()}`, afterSpeech);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleListening = (forceStart = false) => {
    if (setup.mode === "text") {
      if (!forceStart) setError("Text mode is on — type your answer and select Send answer.");
      return;
    }
    if (micMutedRef.current) {
      if (!forceStart) setError("Microphone is muted — unmute it to speak.");
      return;
    }
    if (listening) {
      if (forceStart) return;
      continueListeningRef.current = false;
      const isWaitingToRestart = recognitionRestartRef.current !== null;
      window.clearTimeout(recognitionRestartRef.current);
      recognitionRestartRef.current = null;
      const transcript = getRecognitionTranscript();
      if (transcript) setDraft(transcript);
      setAnswerCaptureComplete(true);
      if (isWaitingToRestart) {
        updateListening(false);
        recognitionRef.current = null;
      } else if (recognitionRef.current) {
        recognitionRef.current?.stop();
      } else {
        updateListening(false);
      }
      if (autoMode) autoSubmitPendingRef.current = true;
      stopAudioRecording();
      return;
    }
    if (!startedRef.current && !forceStart) {
      setError("Start the live interview before speaking.");
      return;
    }
    if ((busy && !forceStart) || endedRef.current) return;
    if (speakingRef.current) {
      setError("Genie is still speaking. Wait for the question to finish, then answer.");
      return;
    }
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition && (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)) {
      setError("Voice input is not supported in this browser. Type your answer and select Send answer.");
      return;
    }

    continueListeningRef.current = true;
    if (!preserveTranscriptRef.current) {
      recognitionTranscriptRef.current = "";
      recognitionInterimRef.current = "";
    }
    preserveTranscriptRef.current = false;
    networkRetryCountRef.current = 0;
    hasSpeechRef.current = false;
    lastSpeechAtRef.current = Date.now();
    setAnswerCaptureComplete(false);
    setTranscribing(false);
    let recognition = null;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = speechLanguages[setup.language] || navigator.language || "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const transcript = event.results[index][0]?.transcript?.trim();
          if (!transcript) continue;
          if (event.results[index].isFinal) {
            recognitionTranscriptRef.current = `${recognitionTranscriptRef.current} ${transcript}`.trim();
          } else {
            interimTranscript = `${interimTranscript} ${transcript}`.trim();
          }
        }
        recognitionInterimRef.current = interimTranscript;
        if (interimTranscript || recognitionTranscriptRef.current) {
          networkRetryCountRef.current = 0;
          hasSpeechRef.current = true;
          lastSpeechAtRef.current = Date.now();
        }
        setDraft(getRecognitionTranscript());
        setError("");
      };
      recognition.onerror = (event) => {
        if (event.error === "aborted" && !continueListeningRef.current) return;
        if (event.error === "no-speech" && continueListeningRef.current) return;

        if (event.error === "network" &&
          continueListeningRef.current &&
          networkRetryCountRef.current < 2) {
          networkRetryCountRef.current += 1;
          setError(`Voice connection interrupted. Reconnecting (${networkRetryCountRef.current}/2)…`);
          const transcript = getRecognitionTranscript();
          if (transcript) setDraft(transcript);
          return;
        }

        continueListeningRef.current = false;
        const transcript = getRecognitionTranscript();
        const message = event.error === "not-allowed"
          ? "Microphone access was denied. Allow it in your browser settings, or type your answer."
          : event.error === "network"
            ? transcript
              ? "Voice recognition could not reconnect. Your captured words are in the answer box; add anything missing or try again."
              : "Voice recognition could not connect before transcribing. Check your internet connection and microphone permission, then try again or type your answer."
            : event.error === "no-speech"
              ? "No speech was detected. Try again or type your answer."
              : transcript
                ? `Voice input failed (${event.error}). Your captured words are in the answer box; you can type the rest.`
                : `Voice input failed (${event.error}). Try again or type your answer.`;
        setError(message);
        updateListening(false);
        setAnswerCaptureComplete(true);
        if (transcript) setDraft((current) => current.trim() || transcript);
        stopAudioRecording();
      };
      recognition.onend = () => {
        const answer = getRecognitionTranscript();
        if (continueListeningRef.current && startedRef.current && !endedRef.current) {
          recognitionRestartRef.current = window.setTimeout(() => {
            recognitionRestartRef.current = null;
            if (!continueListeningRef.current || endedRef.current) return;
            try {
              recognition.start();
            } catch (recognitionError) {
              continueListeningRef.current = false;
              recognitionRef.current = null;
              setDraft(answer);
              setError("Voice input paused unexpectedly. Your recognized words are saved; review them or continue typing.");
              updateListening(false);
            }
          }, networkRetryCountRef.current ? 500 * networkRetryCountRef.current : 200);
          return;
        }
        updateListening(false);
        recognitionRef.current = null;
        setAnswerCaptureComplete(true);
        if (answer) setDraft((current) => current.trim() || answer);
        stopAudioRecording();
      };

      try {
        recognitionRef.current = recognition;
        recognition.start();
      } catch (recognitionError) {
        continueListeningRef.current = false;
        recognitionRef.current = null;
        setError(`Could not start voice input: ${recognitionError.message}`);
        updateListening(false);
        return;
      }
    } else {
      setError("Live speech recognition is unavailable. Your recorded answer will be transcribed after you stop.");
    }
    updateListening(true);
    const capturePromise = startAudioRecording();
    audioCaptureStartRef.current = capturePromise;
    capturePromise.then((recordingStarted) => {
      if (audioCaptureStartRef.current === capturePromise) audioCaptureStartRef.current = null;
      if (!continueListeningRef.current && !endedRef.current) {
        if (!recordingStarted && !getRecognitionTranscript()) {
          setTranscribing(false);
          setError("No audio was captured. Allow microphone access, try speaking again, or type your answer.");
        }
      }
    }).catch((recordingError) => {
      console.error("Could not start backup interview audio recording.", recordingError);
      if (audioCaptureStartRef.current === capturePromise) audioCaptureStartRef.current = null;
      if (endedRef.current) return;
      if (continueListeningRef.current) {
        setError("Backup audio recording is unavailable. Live speech recognition may still fill the answer box.");
      } else if (!getRecognitionTranscript()) {
        setTranscribing(false);
        setError("No transcript was captured. Allow microphone access, try speaking again, or type your answer.");
      }
    });
    if (SpeechRecognition) {
      setError("");
    }
  };

  useEffect(() => {
    if (!listening || !autoMode) return undefined;
    const timer = window.setInterval(() => {
      if (hasSpeechRef.current && Date.now() - lastSpeechAtRef.current > 4000) {
        hasSpeechRef.current = false;
        toggleListening();
      }
    }, 400);
    return () => window.clearInterval(timer);
  }, [listening, autoMode]);

  useEffect(() => {
    if (!autoSubmitPendingRef.current || busy || listening || transcribing || paused) return;
    const answer = draft.trim();
    if (!answer) {
      if (answerCaptureComplete) autoSubmitPendingRef.current = false;
      return;
    }
    autoSubmitPendingRef.current = false;
    submitAnswer(answer);
  });

  useEffect(() => {
    if (!started || ended || paused) return undefined;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAtRef.current - pausedTotalRef.current) / 1000)));
      if (remaining <= 0) finishInterview(historyRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, ended, paused]);

  const sendTypedAnswer = (event) => {
    event.preventDefault();
    autoSubmitPendingRef.current = false;
    submitAnswer(draft.trim());
  };

  const suspendCapture = () => {
    continueListeningRef.current = false;
    window.clearTimeout(recognitionRestartRef.current);
    recognitionRestartRef.current = null;
    recognitionRef.current?.stop();
    stopAudioRecording();
    updateListening(false);
  };

  const toggleMicMute = () => {
    const nextMuted = !micMutedRef.current;
    micMutedRef.current = nextMuted;
    setMicMuted(nextMuted);
    if (nextMuted) {
      if (listening) {
        preserveTranscriptRef.current = true;
        suspendCapture();
      }
      return;
    }
    const lastTurn = historyRef.current[historyRef.current.length - 1];
    if (setup.mode !== "text" && startedRef.current && !endedRef.current && !busy &&
        !speakingRef.current && lastTurn?.speaker === "interviewer" && autoMode) {
      window.setTimeout(() => {
        if (!micMutedRef.current && !pausedRef.current) toggleListening(true);
      }, 0);
    }
  };

  const pauseInterview = () => {
    if (!startedRef.current || endedRef.current || pausedRef.current) return;
    if (speakingRef.current) {
      setError("Wait for Genie to finish speaking before pausing.");
      return;
    }
    if (busy) {
      setError("Wait for Genie to finish evaluating your answer before pausing.");
      return;
    }
    pausedRef.current = true;
    pausedAtRef.current = Date.now();
    setPaused(true);
    resumeListeningRef.current = listening;
    if (listening) preserveTranscriptRef.current = true;
    suspendCapture();
    window.speechSynthesis?.cancel();
    speakingRef.current = false;
    setSubtitle("");
    onSpeakingChange(false);
  };

  const resumeInterview = () => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    setPaused(false);
    if (pausedAtRef.current !== null) {
      pausedTotalRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    endsAtRef.current = Date.now() + Math.max(0, secondsLeft ?? setup.duration * 60) * 1000;
    const shouldListen = resumeListeningRef.current &&
      setup.mode !== "text" && !micMutedRef.current && !busy &&
      historyRef.current[historyRef.current.length - 1]?.speaker === "interviewer";
    resumeListeningRef.current = false;
    if (shouldListen) toggleListening(true);
  };

  const skipQuestion = async () => {
    const currentHistory = historyRef.current;
    if (busy || ended || paused || listening || transcribing) return;
    if (currentHistory[currentHistory.length - 1]?.speaker !== "interviewer") return;
    setBusy(true);
    setError("");
    try {
      const result = await getInterviewerReply(currentHistory, resumeContext, { skip: true });
      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("Genie could not generate the next question. Please try again.");
      }
      skippedCountRef.current += 1;
      const nextHistory = [...currentHistory, { speaker: "interviewer", text: result.reply.trim(), at: Date.now() }];
      setHistory(nextHistory);
      setDraft("");
      setAnswerCaptureComplete(false);
      const coveredCount = nextHistory.filter((turn) => turn.speaker === "candidate").length + skippedCountRef.current;
      speak(result.reply.trim(), () => {
        if (coveredCount >= setup.questions || Date.now() >= endsAtRef.current) {
          finishInterview(nextHistory);
        } else if (!micMutedRef.current && !pausedRef.current) {
          toggleListening(true);
        }
      });
    } catch (skipError) {
      setError(skipError.message || "Could not skip to the next question. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const requestHint = async (level) => {
    const currentQuestion = [...historyRef.current].reverse().find((turn) => turn.speaker === "interviewer")?.text;
    if (!currentQuestion || hintBusy || ended) return;
    const nextLevel = Number.isInteger(level) && level >= 1 && level <= 3 ? level : hintLevel;
    setHintBusy(true);
    setError("");
    try {
      const response = await fetch("/api/interview-hint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: currentQuestion, role, level: nextLevel }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Could not get a hint right now.");
      setHintFor(currentQuestion);
      setHintLevel(nextLevel);
      setHintText(result.hint);
      setHintCount((count) => count + 1);
      setHintOpen(true);
    } catch (hintError) {
      setError(hintError.message || "Could not get a hint right now.");
    } finally {
      setHintBusy(false);
    }
  };

  const repeatQuestion = () => {
    if (busy || ended || paused) return;
    const lastQuestion = [...historyRef.current].reverse().find((turn) => turn.speaker === "interviewer");
    if (!lastQuestion) {
      setError("There is no question to repeat yet.");
      return;
    }
    speak(lastQuestion.text, () => {
      const awaitingAnswer = historyRef.current[historyRef.current.length - 1]?.speaker === "interviewer";
      if (awaitingAnswer && !micMutedRef.current && !pausedRef.current) toggleListening(true);
    });
  };

  const toggleCamera = async () => {
    if (cameraStreamRef.current) {
      stopCamera();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      cameraStreamRef.current = stream;
      setCameraOn(true);
      onCameraChange?.(true);
    } catch {
      setError("Camera access was denied. Allow camera permission to use video mode.");
    }
  };

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraOn(false);
    onCameraChange?.(false);
  };

  useEffect(() => {
    onHistoryChange?.(history);
  }, [history, onHistoryChange]);

  useEffect(() => {
    if (cameraOn && cameraVideoRef.current && cameraStreamRef.current) {
      cameraVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraOn]);

  const finishInterview = (turns) => {
    if (endedRef.current) return;
    endedRef.current = true;
    autoSubmitPendingRef.current = false;
    continueListeningRef.current = false;
    window.clearTimeout(recognitionRestartRef.current);
    recognitionRestartRef.current = null;
    recognitionRef.current?.stop();
    discardAudioRecording();
    audioCaptureStartRef.current = null;
    window.speechSynthesis?.cancel();
    speakingRef.current = false;
    stopCamera();
    onSpeakingChange(false);
    updateListening(false);
    setEnded(true);
    if (!reportSentRef.current) {
      reportSentRef.current = true;
      onInterviewComplete(turns ?? historyRef.current, {
        type: setup.type,
        company: setup.company,
        hintsUsed: hintCount,
        mode: setup.mode,
        language: setup.language,
        elapsedSeconds: Math.max(0, Math.round(elapsed)),
      });
    }
  };

  const endInterview = () => {
    if (endedRef.current) return true;
    if (busy) {
      setError("Wait for Genie to finish evaluating your answer before ending the interview.");
      return false;
    }
    finishInterview(historyRef.current);
    return true;
  };

  if (controlsRef) {
    controlsRef.current = {
      toggleListening: () => toggleListening(),
      endInterview,
      toggleCamera,
      stopCamera,
      pauseInterview,
      resumeInterview,
    };
  }

  return (
    <section className="live-interview-panel" aria-label="Live AI interview">
      <header className="live-interview-heading">
        <div>
          <span className="section-kicker">LIVE AI INTERVIEW</span>
          <h2>Practice with Genie</h2>
        </div>
        {setup.mode !== "text" && (
          <>
            <button
              type="button"
              className={`voice-output-toggle ${voiceEnabled ? "enabled" : ""}`}
              onClick={() => setVoiceEnabled((enabled) => {
                if (enabled) {
                  window.speechSynthesis?.cancel();
                  onSpeakingChange(false);
                }
                return !enabled;
              })}
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? "◖)) Voice on" : "Voice off"}
            </button>
            <button
              type="button"
              className={`voice-output-toggle ${autoMode ? "enabled" : ""}`}
              onClick={() => setAutoMode((enabled) => !enabled)}
              aria-pressed={autoMode}
              title="When on, Genie listens automatically after each question and sends your answer when you pause."
            >
              {autoMode ? "◉ Hands-free on" : "Hands-free off"}
            </button>
          </>
        )}
      </header>

      {cameraOn && (
        <div className="camera-preview">
          <video ref={cameraVideoRef} autoPlay muted playsInline />
          <span>You · Camera on</span>
        </div>
      )}

      {!started ? (
        <div className="live-interview-setup">
          <p className="live-interview-setup-intro">
            {setup.mode === "text"
              ? "Configure your interview, then answer Genie's questions by typing below."
              : "Configure your interview — Genie asks questions out loud, listens to your spoken answers, and replies automatically."}
          </p>
          <div className="interview-setup-grid">
            {companyMode && (
              <label className="setup-field">
                <span>Company</span>
                <input
                  list="interview-companies"
                  value={setup.company}
                  onChange={(event) => updateSetup("company", event.target.value)}
                  placeholder="e.g. Deloitte"
                  aria-label="Target company"
                />
                <datalist id="interview-companies">
                  {interviewCompanies.map((item) => <option key={item} value={item} />)}
                </datalist>
              </label>
            )}
            <label className="setup-field">
              <span>Job Role</span>
              <select value={role} onChange={(event) => onRoleChange?.(event)} aria-label="Interview job role">
                {interviewRoleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            {companyMode && (
              <label className="setup-field">
                <span>Experience</span>
                <select value={setup.experience} onChange={(event) => updateSetup("experience", event.target.value)} aria-label="Candidate experience level">
                  {["", "Fresher", "Junior", "Mid-level", "Senior"].map((item) => <option key={item} value={item}>{item || "Select…"}</option>)}
                </select>
              </label>
            )}
            <label className="setup-field">
              <span>{companyMode ? "Interview Round" : "Interview Type"}</span>
              <select value={setup.type} onChange={(event) => updateSetup("type", event.target.value)} aria-label="Interview type">
                {(companyMode ? companyRoundOptions : interviewTypeOptions).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="setup-field">
              <span>Difficulty</span>
              <select value={setup.difficulty} onChange={(event) => updateSetup("difficulty", event.target.value)} aria-label="Interview difficulty">
                {interviewDifficultyOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="setup-field">
              <span>Duration</span>
              <select value={setup.duration} onChange={(event) => updateSetup("duration", Number(event.target.value))} aria-label="Interview duration">
                {interviewDurationOptions.map((item) => <option key={item} value={item}>{item} min</option>)}
              </select>
            </label>
            <label className="setup-field">
              <span>Questions</span>
              <select value={setup.questions} onChange={(event) => updateSetup("questions", Number(event.target.value))} aria-label="Number of questions">
                {interviewQuestionOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="setup-field">
              <span>Language</span>
              <select value={setup.language} onChange={(event) => updateSetup("language", event.target.value)} aria-label="Interview language">
                {interviewLanguages.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
              </select>
            </label>
            <label className="setup-field">
              <span>Explanations in</span>
              <select value={setup.explanationLanguage} onChange={(event) => updateSetup("explanationLanguage", event.target.value)} aria-label="Explanation language">
                <option value="">Same as interview</option>
                {interviewLanguages.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
              </select>
            </label>
            <label className="setup-field">
              <span>Mode</span>
              <select value={setup.mode} onChange={(event) => updateSetup("mode", event.target.value)} aria-label="Interview mode">
                {interviewModeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </div>
          {companyMode && (
            <p className="company-interview-note">
              Questions are company-oriented practice inspired by typical {setup.company.trim() || "company"} interviews — they are not verified actual interview questions.
            </p>
          )}
          <div className="resume-upload-row">
            <input
              ref={resumeFileRef}
              id="interview-resume-upload"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={uploadResume}
              className="sr-only"
            />
            <label htmlFor="interview-resume-upload" className={`resume-upload-button${resumeBusy ? " busy" : ""}`}>
              {resumeBusy ? "Analyzing resume…" : "⬆ Upload Resume"}
            </label>
            {resumeUpload.name ? (
              <span className="resume-upload-status">
                <strong>{resumeUpload.name}</strong> analyzed — Genie will ask about your skills &amp; projects
                <button type="button" onClick={() => setResumeUpload({ text: "", name: "" })}>Remove</button>
              </span>
            ) : (
              <span className="resume-upload-hint">PDF, DOCX, or TXT — questions become specific to your resume</span>
            )}
          </div>
          <div className="prep-links-row">
            <label className="prep-link-label">LinkedIn URL (Optional)</label>
            <input value={prepLinks.linkedin} onChange={(event) => setPrepLinks((current) => ({ ...current, linkedin: event.target.value }))} placeholder="https://linkedin.com/in/..." />
            <label className="prep-link-label">GitHub URL (Optional)</label>
            <input value={prepLinks.github} onChange={(event) => setPrepLinks((current) => ({ ...current, github: event.target.value }))} placeholder="https://github.com/..." />
            <label className="prep-link-label">Portfolio URL (Optional)</label>
            <input value={prepLinks.portfolio} onChange={(event) => setPrepLinks((current) => ({ ...current, portfolio: event.target.value }))} placeholder="https://..." />
          </div>
          <div className="prep-textareas-row">
            <label className="prep-textarea-label">Additional Information</label>
            <textarea value={prepLinks.additionalInfo} onChange={(event) => setPrepLinks((current) => ({ ...current, additionalInfo: event.target.value }))} placeholder="Tell us more about yourself, your projects, achievements…" rows="2" />
            <label className="prep-textarea-label">Job Description</label>
            <textarea value={prepLinks.jobDescription} onChange={(event) => setPrepLinks((current) => ({ ...current, jobDescription: event.target.value }))} placeholder="Paste the job description here" rows="2" />
          </div>
          <div className="live-interview-start-actions">
            <button type="button" className="primary-button" onClick={startInterview} disabled={busy}>
              {busy ? "Starting interview…" : setup.mode === "text" ? "Start text interview" : "Start live interview"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="live-interview-transcript" aria-live="polite">
            {history.map((turn, index) => (
              <article className={`live-interview-turn ${turn.speaker}`} key={`${index}-${turn.speaker}`}>
                <strong>{turn.speaker === "interviewer" ? "Genie AI" : "You"}</strong>
                <p>{turn.text}</p>
                {turn.speaker === "candidate" && turn.evaluation && (
                  <small className="live-interview-evaluation">
                    <strong>{assessmentLabels[turn.evaluation.assessment]}:</strong> {turn.evaluation.feedback}
                  </small>
                )}
                {turn.speaker === "candidate" && turn.speech && (
                  <small className="speech-analysis-line">
                    Speech: {turn.speech.wpm !== null ? `${turn.speech.wpm} WPM` : "—"}
                    {" · "}{turn.speech.fillerWords} filler{turn.speech.fillerWords === 1 ? "" : "s"}
                    {turn.speech.longPauses !== null ? ` · ${turn.speech.longPauses} long pause${turn.speech.longPauses === 1 ? "" : "s"}` : ""}
                    {turn.speech.repeatedWords ? ` · ${turn.speech.repeatedWords} repeated` : ""}
                    {turn.speech.clarity !== null ? ` · clarity ${turn.speech.clarity}%` : ""}
                    {turn.speech.score !== null ? ` · score ${turn.speech.score}/100` : ""}
                  </small>
                )}
                {turn.speaker === "candidate" && (
                  <AnswerSuggestions
                    question={[...history.slice(0, index)].reverse().find((item) => item.speaker === "interviewer")?.text}
                    answer={turn.text}
                    role={role}
                    evaluation={turn.evaluation}
                  />
                )}
              </article>
            ))}
            {busy && <p className="live-interview-thinking" role="status">Genie is thinking…</p>}
          </div>
          {subtitle && (
            <p className="live-interview-subtitle" aria-live="polite"><strong>Genie AI:</strong> {subtitle}</p>
          )}
          {listening && setup.mode !== "text" && (
            <div className="speech-meter" aria-live="polite">
              <canvas ref={waveCanvasRef} className="speech-waveform" aria-label="Live microphone waveform" />
              <div className="speech-meter-stats">
                <span className={`speech-level ${liveWpm !== null ? "speaking" : ""}`} aria-hidden="true" />
                <strong>{liveWpm !== null ? `~${liveWpm} WPM` : "Listening…"}</strong>
                <small>speaking pace</small>
              </div>
            </div>
          )}
          {!ended && (
            <form className="live-interview-compose" onSubmit={sendTypedAnswer}>
              <label className="sr-only" htmlFor="live-interview-answer">Your spoken or written answer</label>
              <textarea
                id="live-interview-answer"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Your spoken answer appears here, or type an answer…"
                rows="3"
                disabled={busy || paused}
              />
              <div className="live-interview-actions">
                {setup.mode !== "text" && (
                  <div className="live-interview-recording-controls">
                    <button
                      type="button"
                      className={`primary-button live-interview-mic-button${micMuted ? " is-muted" : ""}`}
                      onClick={() => (micMuted ? toggleMicMute() : toggleListening())}
                      disabled={busy || paused}
                    >
                      {listening ? "Stop listening" : micMuted ? "Muted — tap to unmute" : "Start speaking"}
                    </button>
                    <span
                      className={`live-interview-timer${listening ? " is-active" : ""}`}
                      role="timer"
                      aria-label={`Listening time ${formatListeningDuration(listeningDuration)}`}
                    >
                      {listening && <span aria-hidden="true">● </span>}
                      {formatListeningDuration(listeningDuration)}
                    </span>
                  </div>
                )}
                <button type="submit" className="primary-button" disabled={(!draft.trim() && !answerCaptureComplete) || busy || listening || transcribing || paused}>
                  {busy ? "Sending…" : transcribing ? "Transcribing…" : "Send answer"}
                </button>
              </div>
            </form>
          )}
          {!ended && (
            <div className="live-interview-controls-row">
              <button
                type="button"
                onClick={() => requestHint(hintLevel)}
                disabled={busy || paused || history[history.length - 1]?.speaker !== "interviewer"}
                title="Get a hint for the current question"
              >
                💡 Hint{hintCount ? ` (${hintCount})` : ""}
              </button>
              <button
                type="button"
                onClick={skipQuestion}
                disabled={busy || paused || history[history.length - 1]?.speaker !== "interviewer"}
                title="Skip this question and move to the next one"
              >
                Skip question
              </button>
              <button type="button" onClick={repeatQuestion} disabled={busy || paused}>↺ Repeat question</button>
              {setup.mode !== "text" && (
                <button type="button" onClick={toggleMicMute} disabled={paused} aria-pressed={micMuted}>
                  {micMuted ? "Unmute mic" : "Mute mic"}
                </button>
              )}
              <button type="button" onClick={paused ? resumeInterview : pauseInterview} disabled={busy && !paused}>
                {paused ? "▶ Resume" : "⏸ Pause"}
              </button>
              {setup.mode !== "text" && (
                <button type="button" onClick={toggleCamera}>{cameraOn ? "Camera off" : "Camera on"}</button>
              )}
            </div>
          )}
          {hintOpen && !ended && (
            <aside className="hint-panel" aria-label="Interview hint">
              <header className="hint-panel-heading">
                <strong>Genie hint</strong>
                <span>Hints used: {hintCount}</span>
                <button type="button" onClick={() => setHintOpen(false)} aria-label="Close hint">×</button>
              </header>
              <div className="hint-levels" role="group" aria-label="Hint level">
                {[["Level 1 · Clue", 1], ["Level 2 · Concepts", 2], ["Level 3 · Approach", 3]].map(([label, level]) => (
                  <button
                    key={level}
                    type="button"
                    className={hintLevel === level ? "active" : ""}
                    onClick={() => requestHint(level)}
                    disabled={hintBusy}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {hintBusy ? (
                <p className="hint-panel-body">Genie is thinking of a hint…</p>
              ) : hintFor === [...history].reverse().find((turn) => turn.speaker === "interviewer")?.text && hintText ? (
                <p className="hint-panel-body">{hintText}</p>
              ) : (
                <p className="hint-panel-body hint-empty">Choose a hint level above — Genie will nudge you without giving away the answer.</p>
              )}
              <button
                type="button"
                className="hint-another"
                onClick={() => requestHint(hintLevel)}
                disabled={hintBusy || history[history.length - 1]?.speaker !== "interviewer"}
              >
                {hintBusy ? "Getting hint…" : "↻ Get another hint"}
              </button>
            </aside>
          )}
          <div className="live-interview-footer">
            {started && !ended && secondsLeft !== null && (
              <span className="interview-time-left" role="timer">Time left {formatListeningDuration(secondsLeft)} · {formatListeningDuration(elapsed)} elapsed</span>
            )}
            <span>{ended ? "Interview ended. See Chat for your report." : paused ? "Interview paused — Genie and the microphone are off. Resume when you're ready." : setup.mode === "text" ? "Text mode — type your answer above and select Send answer." : transcribing ? "Transcribing your recording… your answer will appear here shortly." : listening ? (autoMode ? "Listening… pause for a moment after you finish and Genie will respond automatically." : "Listening… your words appear in the answer box. Stop listening to review them.") : answerCaptureComplete && !draft.trim() ? "Recording stopped without a transcript. Type your answer or try speaking again." : listeningDuration ? `Listening stopped at ${formatListeningDuration(listeningDuration)}. Review your answer, then send it for feedback.` : autoMode ? "Genie is speaking or waiting — the microphone turns on automatically after each question." : "Use Start speaking to dictate an answer, or type it in the answer box."}</span>
            {started && <button type="button" onClick={() => onViewTranscript(history)}>View transcript</button>}
            {ended ? (
              <button type="button" onClick={startInterview} disabled={busy}>Start again</button>
            ) : (
              <button type="button" onClick={endInterview} disabled={busy}>End interview</button>
            )}
          </div>
        </>
      )}
      {error && <p className="live-interview-error" role="alert">{error}</p>}
    </section>
  );
}
