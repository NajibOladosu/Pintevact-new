import { CTA, EmailLayout, FallbackLink, Heading, OtpCode, P } from "./_components/layout";

export type MagicLinkEmailProps = { loginUrl: string; token?: string };

export default function MagicLinkEmail({ loginUrl, token }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Your Pintevact sign-in link" footerNote="This link expires in 1 hour and can only be used once. Didn't request it? You can safely ignore this email.">
      <Heading eyebrow="Sign in">Your door back in.</Heading>
      <P>Tap the button below to sign in to Pintevact, no password needed.</P>
      <CTA href={loginUrl}>Sign me in</CTA>
      {token ? (
        <>
          <P>Or use this one-time code:</P>
          <OtpCode code={token} />
        </>
      ) : null}
      <FallbackLink href={loginUrl} />
    </EmailLayout>
  );
}

MagicLinkEmail.PreviewProps = { loginUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=magiclink", token: "193004" } satisfies MagicLinkEmailProps;
