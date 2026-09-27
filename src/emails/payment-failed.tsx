import { CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type PaymentFailedEmailProps = { name?: string | null; amount: string };

export default function PaymentFailedEmail({ name, amount }: PaymentFailedEmailProps) {
  return (
    <EmailLayout preview="Action needed: we couldn't process your payment">
      <Heading>A small hiccup{name ? `, ${name}` : ""}.</Heading>
      <P>We weren&apos;t able to charge {amount} for your All-Access membership. It happens, cards expire, banks get cautious.</P>
      <P>Update your payment method to keep your streak and your access uninterrupted.</P>
      <CTA href={`${siteUrl()}/account/billing`}>Update payment method</CTA>
    </EmailLayout>
  );
}

PaymentFailedEmail.PreviewProps = { name: "Ada", amount: "$29.00" } satisfies PaymentFailedEmailProps;
