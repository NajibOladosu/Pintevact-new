import { Callout, CTA, EmailLayout, FallbackLink, Heading, P } from "./components/layout";
import { Text } from "@react-email/components";

export type ResetPasswordEmailProps = { name?: string | null; resetUrl: string };

export default function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your Pintevact password" footerNote="If you didn't ask to reset your password, you can ignore this email — your password won't change.">
      <Heading eyebrow="Password reset">Forgetting is human{name ? `, ${name}` : ""}.</Heading>
      <P>Fun fact: the brain actively prunes information it deems unimportant. Your password clearly didn&apos;t make the cut. Let&apos;s set a new one.</P>
      <CTA href={resetUrl}>Choose a new password</CTA>
      <Callout tone="iris">
        <Text style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>
          <strong>Memory tip:</strong> build your password from a vivid, absurd image. Bizarre imagery is remembered far better than ordinary phrases (the bizarreness effect).
        </Text>
      </Callout>
      <FallbackLink href={resetUrl} />
    </EmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = { name: "Ada", resetUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=recovery&next=/reset-password" } satisfies ResetPasswordEmailProps;
