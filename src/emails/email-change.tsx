import { CTA, EmailLayout, FallbackLink, Heading, P, SecurityNote } from "./_components/layout";

export type EmailChangeEmailProps = { confirmUrl: string; newEmail: string; isCurrentAddress?: boolean };

export default function EmailChangeEmail({ confirmUrl, newEmail, isCurrentAddress }: EmailChangeEmailProps) {
  return (
    <EmailLayout preview={isCurrentAddress ? `Approve moving your Pintevact account to ${newEmail}` : "Confirm your new Pintevact email address"} reason="You're receiving this because an email change was requested on your Pintevact account.">
      <Heading eyebrow="Email change">New address, same you.</Heading>
      <P>
        {isCurrentAddress ? (
          <>
            Someone, hopefully you, asked to move your Pintevact account to <strong>{newEmail}</strong>. Approve it from this address to finish the change.
          </>
        ) : (
          <>
            Confirm that <strong>{newEmail}</strong> is where your lessons, receipts and reminders should arrive from now on.
          </>
        )}
      </P>
      <CTA href={confirmUrl}>{isCurrentAddress ? "Approve the change" : "Confirm my new email"}</CTA>
      <SecurityNote>Didn&apos;t ask for this? Don&apos;t click anything, and reset your password from the sign-in page to keep your account safe.</SecurityNote>
      <FallbackLink href={confirmUrl} />
    </EmailLayout>
  );
}

EmailChangeEmail.PreviewProps = { confirmUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=email_change", newEmail: "ada@new.com" } satisfies EmailChangeEmailProps;
