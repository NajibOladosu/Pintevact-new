import { Section, Text } from "@react-email/components";
import { brand, EmailLayout, Heading } from "./components/layout";

export type ContactNotificationEmailProps = { name: string; email: string; topic: string; message: string };

export default function ContactNotificationEmail({ name, email, topic, message }: ContactNotificationEmailProps) {
  return (
    <EmailLayout preview={`New ${topic} message from ${name}`}>
      <Heading eyebrow={`Contact form · ${topic}`}>New message from {name}</Heading>
      <Text style={{ margin: "0 0 12px", fontSize: 14, color: brand.ink3 }}>Reply directly to this email to respond to {email}.</Text>
      <Section style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #d8cfbd" }}>
        <Text style={{ margin: 0, fontSize: 15, lineHeight: "24px", whiteSpace: "pre-wrap" }}>{message}</Text>
      </Section>
    </EmailLayout>
  );
}

ContactNotificationEmail.PreviewProps = { name: "Ada", email: "ada@example.com", topic: "teams", message: "Hi! We'd love Pintevact for our 40-person team." } satisfies ContactNotificationEmailProps;
