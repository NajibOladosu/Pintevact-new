import { EmailLayout, Heading, OtpCode, P, SecurityNote } from "./_components/layout";

export type ReauthenticationEmailProps = { token: string };

export default function ReauthenticationEmail({ token }: ReauthenticationEmailProps) {
  return (
    <EmailLayout preview={`Your Pintevact verification code is ${token}`} reason="You're receiving this because a sensitive change was requested on your Pintevact account.">
      <Heading eyebrow="Security check">Just making sure it&apos;s you.</Heading>
      <P>Enter this code in Pintevact to confirm the change you&apos;re making to your account.</P>
      <OtpCode code={token} label="Verification code" />
      <SecurityNote>Never share this code. Nobody at Pintevact will ever ask you for it. It expires in 10 minutes.</SecurityNote>
    </EmailLayout>
  );
}

ReauthenticationEmail.PreviewProps = { token: "550129" } satisfies ReauthenticationEmailProps;
