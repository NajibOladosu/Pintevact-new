import { CTA, EmailLayout, FallbackLink, Heading, P } from "./_components/layout";

export type EmailChangeEmailProps = { confirmUrl: string; newEmail: string; isCurrentAddress?: boolean };

export default function EmailChangeEmail({ confirmUrl, newEmail, isCurrentAddress }: EmailChangeEmailProps) {
  return (
    <EmailLayout preview="Confirm your new Pintevact email address" footerNote="If you didn't request this change, please secure your account by resetting your password.">
      <Heading>New address, same you.</Heading>
      <P>
        {isCurrentAddress
          ? `Someone (hopefully you) asked to change your Pintevact email to ${newEmail}. Confirm from this address to approve it.`
          : `Confirm that ${newEmail} is where you'd like your Pintevact updates to land from now on.`}
      </P>
      <CTA href={confirmUrl}>Confirm email change</CTA>
      <FallbackLink href={confirmUrl} />
    </EmailLayout>
  );
}

EmailChangeEmail.PreviewProps = { confirmUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=email_change", newEmail: "ada@new.com" } satisfies EmailChangeEmailProps;
