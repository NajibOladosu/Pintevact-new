import { CTA, Details, EmailLayout, Heading, P, siteUrl, Small } from "./_components/layout";

export type PurchaseReceiptEmailProps = {
  name?: string | null;
  courseTitle: string;
  courseSlug: string;
  amount: string;
  orderId: string;
  date: string;
};

export default function PurchaseReceiptEmail({ name, courseTitle, courseSlug, amount, orderId, date }: PurchaseReceiptEmailProps) {
  return (
    <EmailLayout band="amber" preview={`Receipt: ${courseTitle}, ${amount}. It's yours to keep.`} footerNote="Questions about this order? Just reply to this email." reason="You're receiving this receipt because you bought a course on Pintevact.">
      <Heading eyebrow="Receipt">{name ? `It's yours, ${name}. For good.` : "It's yours. For good."}</Heading>
      <P>
        Thank you for investing in <strong>{courseTitle}</strong>. We value what we put effort into, so here&apos;s to the effort ahead.
      </P>
      <Details rows={[["Course", courseTitle], ["Date", date], ["Order", orderId], ["Access", "Lifetime"]]} total={["Total paid", amount]} />
      <Small>Stripe sends a separate payment receipt for your records. Single-course purchases have a 30-day money-back guarantee.</Small>
      <CTA href={`${siteUrl()}/learn/${courseSlug}`}>Begin the course</CTA>
    </EmailLayout>
  );
}

PurchaseReceiptEmail.PreviewProps = {
  name: "Ada",
  courseTitle: "Emotional Alchemy",
  courseSlug: "emotional-alchemy",
  amount: "$79.00",
  orderId: "a1B2c3D4e5F6",
  date: "Sep 28, 2026",
} satisfies PurchaseReceiptEmailProps;
