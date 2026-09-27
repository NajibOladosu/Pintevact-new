import { Section, Text } from "@react-email/components";
import { brand, CTA, EmailLayout, Heading, P, siteUrl } from "./components/layout";

export type PurchaseReceiptEmailProps = {
  name?: string | null;
  courseTitle: string;
  courseSlug: string;
  amount: string;
  orderId: string;
  date: string;
};

export default function PurchaseReceiptEmail({ name, courseTitle, courseSlug, amount, orderId, date }: PurchaseReceiptEmailProps) {
  const row = (label: string, value: string) => (
    <tr>
      <td style={{ padding: "8px 0", fontSize: 14, color: brand.ink3 }}>{label}</td>
      <td style={{ padding: "8px 0", fontSize: 14, textAlign: "right", fontWeight: 600 }}>{value}</td>
    </tr>
  );
  return (
    <EmailLayout preview={`Your receipt for ${courseTitle}`} footerNote="Questions about your order? Just reply to this email.">
      <Heading eyebrow="Receipt">It&apos;s yours{name ? `, ${name}` : ""}. Forever.</Heading>
      <P>
        Thank you for investing in <strong>{courseTitle}</strong>. Research on the IKEA effect says we value what we put effort into — so here&apos;s to the effort ahead.
      </P>
      <Section style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "8px 20px", border: "1px solid #d8cfbd" }}>
        <table role="presentation" style={{ width: "100%" }}>
          <tbody>
            {row("Course", courseTitle)}
            {row("Date", date)}
            {row("Order", orderId)}
            <tr>
              <td style={{ padding: "12px 0 8px", fontSize: 16, borderTop: "1px solid #d8cfbd" }}>Total paid</td>
              <td style={{ padding: "12px 0 8px", fontSize: 20, textAlign: "right", fontFamily: brand.display, borderTop: "1px solid #d8cfbd" }}>{amount}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={{ fontSize: 12, color: brand.ink3, margin: "8px 0 0" }}>A full Stripe receipt is sent separately for your records.</Text>
      <CTA href={`${siteUrl()}/learn/${courseSlug}`}>Begin the course</CTA>
    </EmailLayout>
  );
}

PurchaseReceiptEmail.PreviewProps = {
  name: "Ada",
  courseTitle: "Emotional Alchemy",
  courseSlug: "emotional-alchemy",
  amount: "$79.00",
  orderId: "cs_test_a1B2c3",
  date: "Sep 27, 2026",
} satisfies PurchaseReceiptEmailProps;
