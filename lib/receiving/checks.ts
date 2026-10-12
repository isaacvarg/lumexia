// The visual inspection every received PO line goes through at the dock. Answers are stored on the receipt
// line by key, so keys must stay stable; labels and prompts can change.

export type CheckAnswer = "pass" | "fail" | "na";

export type ReceivingCheck = {
  key: string;
  label: string;
  prompt: string;
  // some checks don't apply to every container, e.g. bags have no seal
  allowNa?: boolean;
};

export const receivingChecks: ReceivingCheck[] = [
  { key: "rightItem", label: "Right item", prompt: "Name and grade on the containers match what was ordered" },
  { key: "packaging", label: "Packaging intact", prompt: "No damage, dents, leaks, swelling or residue on any container" },
  { key: "seals", label: "Seals intact", prompt: "Seals and closures unbroken, no sign of tampering", allowNa: true },
  { key: "labels", label: "Supplier labels", prompt: "Supplier labels readable, with a lot number on each container" },
  { key: "quantity", label: "Count matches slip", prompt: "Containers and quantity match the packing slip" },
];

export type CheckAnswers = Record<string, CheckAnswer>;

export const failedChecks = (answers: CheckAnswers) => receivingChecks.filter((c) => answers[c.key] === "fail");

// Unanswered checks; every check needs an answer before a line can be received.
export const unansweredChecks = (answers: CheckAnswers) => receivingChecks.filter((c) => !answers[c.key]);

export const checkLabel = (key: string) => receivingChecks.find((c) => c.key === key)?.label ?? key;
