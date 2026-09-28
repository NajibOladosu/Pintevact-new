import { CTA, EmailLayout, FallbackLink, Heading, OtpCode, P, SecurityNote, Small } from "./_components/layout";

export type MagicLinkEmailProps = { loginUrl: string; token?: string };

export default function MagicLinkEmail({ loginUrl, token }: MagicLinkEmailProps) {
  return (
    <EmailLayout band="violet" preview="Your sign-in link for Pintevact. It works once and expires in an hour." reason="You're receiving this because someone asked to sign in to Pintevact with this address.">
      <Heading eyebrow="Your sign-in link">Welcome back.</Heading>
      <P>Your answers, your reflections, your next lesson. All right where you left them. Tap below to sign in, no password needed.</P>
      <CTA href={loginUrl}>Sign me in</CTA>
      {token ? (
        <>
          <Small>Or type this one-time code instead:</Small>
          <OtpCode code={token} />
        </>
      ) : null}
      <SecurityNote>This link works once and expires in 1 hour. If you didn&apos;t ask to sign in, you can ignore this email; nobody can get in without it.</SecurityNote>
      <FallbackLink href={loginUrl} />
    </EmailLayout>
  );
}

MagicLinkEmail.PreviewProps = { loginUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=magiclink", token: "193004" } satisfies MagicLinkEmailProps;
