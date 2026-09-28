import { CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type ContactAutoReplyEmailProps = { name: string };

export default function ContactAutoReplyEmail({ name }: ContactAutoReplyEmailProps) {
  return (
    <EmailLayout preview="We got your message. A person will reply within one or two working days." reason="You're receiving this because you wrote to us through pintevact.com.">
      <Heading eyebrow="We got your message">Thanks, {name}. We&apos;re on it.</Heading>
      <P>A real person on the Pintevact team will read your message and reply within one or two working days. You can reply to this email to add anything.</P>
      <P>While you wait, find out what kind of learner you are. It takes two minutes.</P>
      <CTA href={`${siteUrl()}/discover`}>Take the mind quiz</CTA>
    </EmailLayout>
  );
}

ContactAutoReplyEmail.PreviewProps = { name: "Ada" } satisfies ContactAutoReplyEmailProps;
