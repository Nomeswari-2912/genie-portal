const privateDataPatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b\d{3}[- ]\d{2}[- ]\d{4}\b/,
  /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/,
];

const restrictedTopicRules = [
  {
    label: "Self-harm instructions",
    category: "self_harm",
    pattern: /\b(?:how (?:do i|can i|to)|best way to|steps? to|instructions? (?:for|on)|help me)\s+(?:kill|hurt|poison)\s+myself\b/i,
  },
  {
    label: "Violent harm",
    category: "violent_harm",
    pattern: /\b(?:make|build|assemble|detonate)\s+(?:(?:a|an)\s+)?(?:bomb|explosive|weapon)\b/i,
  },
  {
    label: "Cyber abuse",
    category: "cyber_abuse",
    pattern: /\b(?:write|create|build|deploy)\s+(?:(?:a|an)\s+)?(?:malware|ransomware|credential stealer|phishing kit)\b|\b(?:steal credentials|hack into someone else's (?:account|system)|bypass (?:a )?(?:login|authentication))\b/i,
  },
  {
    label: "Privacy invasion",
    category: "privacy_invasion",
    pattern: /\b(?:dox|publish|reveal|track|locate)\b.{0,60}\b(?:someone's|private|home)\b.{0,35}\b(?:address|phone number|location|identity)\b/i,
  },
];

function collectText(value, parts, budget) {
  if (budget.remaining <= 0) return;
  if (typeof value === "string") {
    const text = value.slice(0, budget.remaining);
    parts.push(text);
    budget.remaining -= text.length;
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, parts, budget));
    return;
  }
  if (!value || typeof value !== "object") return;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return;
  Object.values(value).forEach((item) => collectText(item, parts, budget));
}

export function inspectGuardrailInput(input) {
  const parts = [];
  collectText(input, parts, { remaining: 30000 });
  const text = parts.join("\n");
  return {
    privacyWarning: privateDataPatterns.some((pattern) => pattern.test(text)),
    restrictedTopic: restrictedTopicRules.find(({ pattern }) => pattern.test(text)) ?? null,
  };
}

export function createGuardrailMonitor() {
  const metrics = {
    allowedRequests: 0,
    blockedRequests: 0,
    privacyWarnings: 0,
    restrictedTopicAlerts: 0,
    recentEvents: [],
    startedAt: new Date().toISOString(),
  };
  const controls = [
    { name: "Input validation", detail: "Request schemas, sizes, and roles are checked.", status: "Active" },
    { name: "Content moderation", detail: "High-risk requests are screened and provider safety filters are enabled.", status: "Active" },
    { name: "Privacy protection", detail: "Common personal-data patterns are flagged; request text is not retained.", status: "Active" },
    { name: "Output validation", detail: "AI responses are checked before being returned to the app.", status: "Active" },
  ];

  const middleware = (request, response, next) => {
    if (request.originalUrl.split("?")[0] === "/api/guardrails" || request.method === "OPTIONS") {
      next();
      return;
    }

    const sendJson = response.json.bind(response);
    response.json = (body) => {
      if (!request.guardrailEventRecorded) {
        request.guardrailEventRecorded = true;
        const inspection = inspectGuardrailInput(request.body);
        const statusCode = response.statusCode;
        const decision = statusCode >= 200 && statusCode < 300
          ? "allowed"
          : statusCode >= 400 && statusCode < 500
            ? "blocked"
            : "failed";
        if (decision === "allowed") metrics.allowedRequests += 1;
        if (decision === "blocked") metrics.blockedRequests += 1;
        if (inspection.privacyWarning) metrics.privacyWarnings += 1;
        if (inspection.restrictedTopic) metrics.restrictedTopicAlerts += 1;

        const labels = [];
        if (inspection.restrictedTopic) labels.push(`Restricted topic: ${inspection.restrictedTopic.label}`);
        if (inspection.privacyWarning) labels.push("Privacy warning");
        if (!labels.length) {
          labels.push(decision === "blocked"
            ? "Input validation"
            : decision === "failed"
              ? "Service error"
              : "Request allowed");
        }
        metrics.recentEvents.unshift({
          timestamp: new Date().toISOString(),
          method: request.method,
          path: request.originalUrl.split("?")[0],
          decision,
          labels,
        });
        metrics.recentEvents.length = Math.min(metrics.recentEvents.length, 30);
      }
      return sendJson(body);
    };
    next();
  };

  const enforceInput = (request, response, next) => {
    const { restrictedTopic } = inspectGuardrailInput(request.body);
    if (!restrictedTopic) {
      next();
      return;
    }
    const message = restrictedTopic.category === "self_harm"
      ? "I'm sorry you're feeling this way. I can't help with self-harm instructions. If you may be in immediate danger, contact local emergency services and reach out to someone you trust. I can help find support resources in your area."
      : "I can't help with instructions that could enable harm, cyber abuse, or privacy invasion. I can help with safety, prevention, recovery, or lawful educational information instead.";
    response.status(403).json({ error: message });
  };

  return {
    middleware,
    enforceInput,
    getSnapshot: () => ({
      ...metrics,
      recentEvents: [...metrics.recentEvents],
      controls,
    }),
  };
}
