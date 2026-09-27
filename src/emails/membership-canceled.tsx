import { CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type MembershipCanceledEmailProps = { name?: string | null; accessUntil: string | null };

export default function MembershipCanceledEmail({ name, accessUntil }: MembershipCanceledEmailProps) {
  return (
    <EmailLayout preview="Your All-Access membership has been canceled">
      <Heading eyebrow="Membership update">Thank you for the journey{name ? `, ${name}` : ""}.</Heading>
      <P>
        Your All-Access membership has been canceled.{" "}
        {accessUntil ? `You'll keep full access until ${accessUntil}.` : "Your access to member courses has ended."} Your reflections, notes and certificates stay with you forever.
      </P>
      <P>If something wasn&apos;t working for you, we&apos;d genuinely love to hear it — just reply to this email.</P>
      <CTA href={`${siteUrl()}/pricing`}>Rejoin any time</CTA>
    </EmailLayout>
  );
}

MembershipCanceledEmail.PreviewProps = { name: "Ada", accessUntil: "Oct 27, 2026" } satisfies MembershipCanceledEmailProps;
