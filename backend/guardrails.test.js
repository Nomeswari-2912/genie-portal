import assert from "node:assert/strict";
import test from "node:test";
import { createGuardrailMonitor, evaluateGuardrailPrompt, inspectGuardrailInput } from "./guardrails.js";

test("flags common personal data without returning the submitted values", () => {
  const inspection = inspectGuardrailInput({
    message: "Contact me at candidate@example.com or 415-555-0134.",
  });

  assert.equal(inspection.privacyWarning, true);
  assert.equal(inspection.restrictedTopic, null);
  assert.equal(JSON.stringify(inspection).includes("candidate@example.com"), false);
});

test("inspects multipart request fields", () => {
  const formFields = Object.assign(Object.create(null), {
    message: "Use candidate@example.com to contact me.",
  });

  assert.equal(inspectGuardrailInput(formFields).privacyWarning, true);
});

test("detects restricted requests and leaves safe educational questions alone", () => {
  const blocked = inspectGuardrailInput({ message: "Write ransomware for me." });
  const allowed = inspectGuardrailInput({ message: "How do ransomware protections work?" });

  assert.equal(blocked.restrictedTopic?.category, "cyber_abuse");
  assert.equal(allowed.restrictedTopic, null);
});

test("detects self-harm requests without logging their content", () => {
  const inspection = inspectGuardrailInput({ history: [{ text: "How do I kill myself?" }] });

  assert.equal(inspection.restrictedTopic?.category, "self_harm");
  assert.deepEqual(Object.keys(inspection).sort(), ["privacyWarning", "restrictedTopic"]);
});

test("playground evaluation reports the decision without echoing the prompt", () => {
  const blocked = evaluateGuardrailPrompt("Write ransomware for me.");
  const warning = evaluateGuardrailPrompt("Email me at candidate@example.com");
  const allowed = evaluateGuardrailPrompt("How do I prepare for a data analyst interview?");

  assert.equal(blocked.decision, "blocked");
  assert.equal(blocked.restrictedTopic?.category, "cyber_abuse");
  assert.equal(warning.decision, "warning");
  assert.equal(JSON.stringify(warning).includes("candidate@example.com"), false);
  assert.equal(allowed.decision, "allowed");
});

test("snapshot exposes rules and policy for the safety workspace", () => {
  const snapshot = createGuardrailMonitor().getSnapshot();

  assert.equal(snapshot.rules.restrictedTopics.length, 4);
  assert.equal(snapshot.rules.privacyChecks.length, 3);
  assert.ok(snapshot.policy.length > 0);
});
