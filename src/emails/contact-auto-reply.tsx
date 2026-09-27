import { CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type ContactAutoReplyEmailProps = { name: string };

export default function ContactAutoReplyEmail({ name }: ContactAutoReplyEmailProps) {
  return (
    <EmailLayout preview="We got your message, a human will reply soon">
      <Heading>Thanks, {name}. We&apos;re on it.</Heading>
      <P>A real human on the Pintevact team will read your message and reply within one or two working days.</P>
      <P>While you wait, why not discover your learning archetype? It takes two minutes.</P>
      <CTA href={`${siteUrl()}/discover`}>Take the mind quiz</CTA>
    </EmailLayout>
  );
}

ContactAutoReplyEmail.PreviewProps = { name: "Ada" } satisfies ContactAutoReplyEmailProps;
