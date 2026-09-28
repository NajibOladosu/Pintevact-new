import { CTA, Details, EmailLayout, Heading, P, SecurityNote, siteUrl } from "./_components/layout";

export type PasswordChangedEmailProps = { name?: string | null; changedAt: string };

export default function PasswordChangedEmail({ name, changedAt }: PasswordChangedEmailProps) {
  return (
    <EmailLayout preview="Your Pintevact password was changed." reason="You're receiving this security notice because the password on your Pintevact account changed.">
      <Heading eyebrow="Security notice">{name ? `Your password changed, ${name}.` : "Your password changed."}</Heading>
      <P>This is a quick confirmation that the password on your Pintevact account was just updated. If that was you, there&apos;s nothing else to do.</P>
      <Details rows={[["When", changedAt], ["What", "Account password"]]} />
      <SecurityNote>Wasn&apos;t you? Reset your password straight away from the sign-in page, then reply to this email so we can help secure your account.</SecurityNote>
      <CTA href={`${siteUrl()}/forgot-password`} tone="ink">
        Reset my password
      </CTA>
    </EmailLayout>
  );
}

PasswordChangedEmail.PreviewProps = { name: "Ada", changedAt: "Sep 28, 2026, 2:14 PM UTC" } satisfies PasswordChangedEmailProps;
