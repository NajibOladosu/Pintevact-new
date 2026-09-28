import { Callout, CalloutText, CTA, EmailLayout, FallbackLink, Heading, P, SecurityNote } from "./_components/layout";

export type ResetPasswordEmailProps = { name?: string | null; resetUrl: string };

export default function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailLayout band="dusk" preview="Choose a new Pintevact password. The link expires in an hour." reason="You're receiving this because a password reset was requested for your Pintevact account.">
      <Heading eyebrow="Password reset">{name ? `Forgetting is human, ${name}.` : "Forgetting is human."}</Heading>
      <P>The brain prunes what it decides isn&apos;t important, and passwords rarely make the cut. Choose a new one and you&apos;ll be back in your lessons in a minute.</P>
      <CTA href={resetUrl}>Choose a new password</CTA>
      <Callout eyebrow="A memory trick">
        <CalloutText>Build your password from a vivid, slightly absurd image. Bizarre pictures are remembered far better than ordinary phrases, a finding called the bizarreness effect.</CalloutText>
      </Callout>
      <SecurityNote>The link works once and expires in 1 hour. If you didn&apos;t ask for this, ignore it; your password stays the same.</SecurityNote>
      <FallbackLink href={resetUrl} />
    </EmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = { name: "Ada", resetUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=recovery&next=/reset-password" } satisfies ResetPasswordEmailProps;
