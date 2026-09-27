import { EmailLayout, Heading, OtpCode, P } from "./_components/layout";

export type ReauthenticationEmailProps = { token: string };

export default function ReauthenticationEmail({ token }: ReauthenticationEmailProps) {
  return (
    <EmailLayout preview={`Your Pintevact verification code: ${token}`} footerNote="Never share this code. Pintevact staff will never ask for it.">
      <Heading eyebrow="Verify it's you">Quick security check.</Heading>
      <P>Enter this code to confirm a sensitive change to your account:</P>
      <OtpCode code={token} />
    </EmailLayout>
  );
}

ReauthenticationEmail.PreviewProps = { token: "550129" } satisfies ReauthenticationEmailProps;
