export const QUESTION_RESPONSE_SLA_HOURS = 24;

export function getPendingQuestionPriority(createdAt: Date | string, now = new Date()) {
  const createdAtMs = new Date(createdAt).getTime();
  const elapsedHours = Math.max(0, Math.floor((now.getTime() - createdAtMs) / (60 * 60 * 1000)));
  return {
    elapsedHours,
    isOverdue: elapsedHours >= QUESTION_RESPONSE_SLA_HOURS,
  };
}
