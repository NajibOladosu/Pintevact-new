import { CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type MembershipCanceledEmailProps = { name?: string | null; accessUntil: string | null };

export default function MembershipCanceledEmail({ name, accessUntil }: MembershipCanceledEmailProps) {
  return (
    <EmailLayout preview={accessUntil ? `Your All-Access membership ends on ${accessUntil}.` : "Your All-Access membership has ended."} reason="You're receiving this because your All-Access membership changed.">
      <Heading eyebrow="Membership">{name ? `Thank you for the journey, ${name}.` : "Thank you for the journey."}</Heading>
      <P>
        Your All-Access membership has been canceled. {accessUntil ? <>You keep full access until <strong>{accessUntil}</strong>.</> : "Access to member courses has ended."} Your reflections, notes and certificates stay yours either way.
      </P>
      <P>If something wasn&apos;t working, we&apos;d genuinely like to hear it. Just reply to this email.</P>
      <CTA href={`${siteUrl()}/pricing`} tone="ink">
        Rejoin any time
      </CTA>
    </EmailLayout>
  );
}

MembershipCanceledEmail.PreviewProps = { name: "Ada", accessUntil: "Oct 28, 2026" } satisfies MembershipCanceledEmailProps;
