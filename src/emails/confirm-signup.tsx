import { CTA, EmailLayout, FallbackLink, Heading, OtpCode, P, Small } from "./_components/layout";

export type ConfirmSignupEmailProps = { name?: string | null; confirmUrl: string; token?: string };

export default function ConfirmSignupEmail({ name, confirmUrl, token }: ConfirmSignupEmailProps) {
  return (
    <EmailLayout
      band="dawn"
      preview="One click to confirm your email and open your first lesson."
      reason="You're receiving this because this address was used to create a Pintevact account. If that wasn't you, ignore this email and nothing will happen."
    >
      <Heading eyebrow="Confirm your email">{name ? `Come as you are, ${name}.` : "Come as you are."}</Heading>
      <P>You&apos;re one click away from lessons that stop to ask about your life, and a private place for everything you notice along the way.</P>
      <CTA href={confirmUrl}>Confirm my email</CTA>
      {token ? (
        <>
          <Small>Or enter this code on the confirmation screen:</Small>
          <OtpCode code={token} />
        </>
      ) : null}
      <Small>The link works once and expires in 24 hours.</Small>
      <FallbackLink href={confirmUrl} />
    </EmailLayout>
  );
}

ConfirmSignupEmail.PreviewProps = { name: "Ada", confirmUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=signup", token: "482913" } satisfies ConfirmSignupEmailProps;
