import { CTA, EmailLayout, FallbackLink, Heading, P, Steps } from "./_components/layout";

export type InviteEmailProps = { inviteUrl: string };

export default function InviteEmail({ inviteUrl }: InviteEmailProps) {
  return (
    <EmailLayout band="amber" preview="There's a place for you at Pintevact. Accept your invitation." reason="You're receiving this because someone invited this address to Pintevact.">
      <Heading eyebrow="You're invited">A seat is waiting for you.</Heading>
      <P>You&apos;ve been invited to Pintevact: short psychology lessons that pause to ask about your own life, so the ideas land where they matter.</P>
      <Steps
        items={[
          { title: "Accept and set a password", body: "It takes under a minute." },
          { title: "Start with Meet Your Mind", body: "Four lessons, about half an hour, free." },
          { title: "Keep what you notice", body: "Your reflections stay private in your vault." },
        ]}
      />
      <CTA href={inviteUrl}>Accept invitation</CTA>
      <FallbackLink href={inviteUrl} />
    </EmailLayout>
  );
}

InviteEmail.PreviewProps = { inviteUrl: "https://pintevact.com/auth/confirm?token_hash=abc&type=invite" } satisfies InviteEmailProps;
