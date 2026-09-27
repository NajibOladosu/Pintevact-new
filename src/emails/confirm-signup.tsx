import { CTA, EmailLayout, FallbackLink, Heading, OtpCode, P } from "./components/layout";

export type ConfirmSignupEmailProps = { name?: string | null; confirmUrl: string; token?: string };

export default function ConfirmSignupEmail({ name, confirmUrl, token }: ConfirmSignupEmailProps) {
  return (
    <EmailLayout preview="Confirm your email to open your Pintevact mind map" footerNote="You received this because someone signed up for Pintevact with this address. If it wasn't you, ignore this email.">
      <Heading eyebrow="One tiny step">Hello{name ? `, ${name}` : ""}. Let&apos;s make it official.</Heading>
      <P>You&apos;re one click away from a library of interactive psychology courses built to help you understand — and upgrade — the way your mind works.</P>
      <CTA href={confirmUrl}>Confirm my email</CTA>
      {token ? (
        <>
          <P>Or enter this code on the confirmation screen:</P>
          <OtpCode code={token} />
        </>
      ) : null}
      <FallbackLink href={confirmUrl} />
    </EmailLayout>
  );
}

ConfirmSignupEmail.PreviewProps = { name: "Ada", confirmUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=signup", token: "482913" } satisfies ConfirmSignupEmailProps;
