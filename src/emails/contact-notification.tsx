import { Section, Text } from "@react-email/components";
import { brand, Details, EmailLayout, Heading, Small } from "./_components/layout";

export type ContactNotificationEmailProps = { name: string; email: string; topic: string; message: string };

/** Internal: a new message from the contact form. Reply-To is set to the sender. */
export default function ContactNotificationEmail({ name, email, topic, message }: ContactNotificationEmailProps) {
  return (
    <EmailLayout preview={`${name} wrote about ${topic}: ${message.slice(0, 80)}`} reason="Internal notification from the pintevact.com contact form.">
      <Heading eyebrow="New contact message">{name} wrote in.</Heading>
      <Details rows={[["From", name], ["Email", email], ["Topic", topic]]} />
      <Section style={{ backgroundColor: brand.paper, borderRadius: 18, border: `1px solid ${brand.line}`, padding: "18px 22px", margin: "0 0 16px" }}>
        <Text style={{ margin: 0, fontSize: 15, lineHeight: "24px", whiteSpace: "pre-wrap", color: brand.ink }}>{message}</Text>
      </Section>
      <Small>Reply to this email to answer {name} directly.</Small>
    </EmailLayout>
  );
}

ContactNotificationEmail.PreviewProps = { name: "Ada", email: "ada@example.com", topic: "teams", message: "Hi! We'd love Pintevact for our 40-person team." } satisfies ContactNotificationEmailProps;
