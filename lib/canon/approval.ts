// Decides a change request's outcome from its reviews and the data type's approval settings.
// Callers must only record reviews from users who hold the review capability.

type ApprovalSettings = { requiredApprovals: number; requiresDifferentReviewer: boolean };
type Review = { reviewerId: string; approved: boolean };

export type ApprovalOutcome =
  | { outcome: "approved" }
  | { outcome: "rejected"; rejectedBy: string }
  | { outcome: "pending"; approvals: number; required: number };

export const evaluateReviews = (
  settings: ApprovalSettings,
  requestedById: string,
  reviews: Review[],
): ApprovalOutcome => {
  // any single rejection sends the CR back
  const rejection = reviews.find((r) => !r.approved);
  if (rejection) return { outcome: "rejected", rejectedBy: rejection.reviewerId };

  const approvers = new Set(
    reviews
      .filter((r) => r.approved)
      .filter((r) => !settings.requiresDifferentReviewer || r.reviewerId !== requestedById)
      .map((r) => r.reviewerId),
  );

  return approvers.size >= settings.requiredApprovals
    ? { outcome: "approved" }
    : { outcome: "pending", approvals: approvers.size, required: settings.requiredApprovals };
};
