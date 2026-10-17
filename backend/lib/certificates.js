export function qualifiesForCertificate(score, totalQuestions) {
  return Number.isInteger(score)
    && Number.isInteger(totalQuestions)
    && totalQuestions > 0
    && score === totalQuestions;
}

export function buildCertificateNumber(attemptId, issuedAt = new Date()) {
  const year = new Date(issuedAt).getUTCFullYear();
  const suffix = String(attemptId).replace(/[^a-f0-9]/gi, "").slice(-8).toUpperCase();
  return `QM-${year}-${suffix || "00000000"}`;
}
