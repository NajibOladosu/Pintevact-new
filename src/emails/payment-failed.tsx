import { CTA, Details, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type PaymentFailedEmailProps = { name?: string | null; amount: string };

export default function PaymentFailedEmail({ name, amount }: PaymentFailedEmailProps) {
  return (
    <EmailLayout preview={`We couldn't take ${amount} for All-Access. Update your card to keep access.`} reason="You're receiving this because a payment for your All-Access membership failed.">
      <Heading eyebrow="Action needed">{name ? `A small hiccup, ${name}.` : "A small hiccup."}</Heading>
      <P>We weren&apos;t able to charge your card for All-Access. It happens: cards expire and banks get cautious.</P>
      <Details rows={[["Amount", amount], ["Membership", "All-Access"], ["What to do", "Update your card"]]} />
      <P>Stripe will retry over the next few days. Updating your payment method now keeps your courses and streak uninterrupted.</P>
      <CTA href={`${siteUrl()}/account/billing`}>Update payment method</CTA>
    </EmailLayout>
  );
}

PaymentFailedEmail.PreviewProps = { name: "Ada", amount: "$29.00" } satisfies PaymentFailedEmailProps;
