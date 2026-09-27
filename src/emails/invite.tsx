import { CTA, EmailLayout, FallbackLink, Heading, P } from "./_components/layout";

export type InviteEmailProps = { inviteUrl: string };

export default function InviteEmail({ inviteUrl }: InviteEmailProps) {
  return (
    <EmailLayout preview="You've been invited to Pintevact">
      <Heading eyebrow="You're invited">A seat at the observatory is waiting.</Heading>
      <P>You&apos;ve been invited to Pintevact — interactive psychology courses for understanding yourself and using that knowledge to your advantage.</P>
      <CTA href={inviteUrl}>Accept invitation</CTA>
      <FallbackLink href={inviteUrl} />
    </EmailLayout>
  );
}

InviteEmail.PreviewProps = { inviteUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=invite" } satisfies InviteEmailProps;
