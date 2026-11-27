import assert from "node:assert/strict";
import test from "node:test";
import { inspectGuardrailInput } from "./guardrails.js";

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
