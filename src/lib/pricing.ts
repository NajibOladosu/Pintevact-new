export const MEMBERSHIP = {
  month: { amountCents: 2900, label: "Monthly", per: "month" },
  year: { amountCents: 24000, label: "Yearly", per: "year" },
} as const;

export type BillingInterval = keyof typeof MEMBERSHIP;

export function yearlySavingsPercent() {
  const full = MEMBERSHIP.month.amountCents * 12;
  return Math.round(((full - MEMBERSHIP.year.amountCents) / full) * 100);
}
