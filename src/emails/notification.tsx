import { absolute, type Band, CTA, EmailLayout, Heading, P } from "./_components/layout";

export type NotificationEmailProps = {
  name?: string | null;
  eyebrow: string;
  title: string;
  /** Paragraphs of plain text. */
  body: string[];
  cta?: { label: string; href: string };
  band?: Band;
  unsubscribeUrl?: string;
};

/** General-purpose notice: announcements, new courses, product updates. */
export default function NotificationEmail({ name, eyebrow, title, body, cta, band, unsubscribeUrl }: NotificationEmailProps) {
  return (
    <EmailLayout band={band} preview={body[0] ?? title} reason="You're receiving this because learning emails are on in your Pintevact account." unsubscribeUrl={unsubscribeUrl}>
      <Heading eyebrow={eyebrow}>{title}</Heading>
      {name ? <P>Hi {name},</P> : null}
      {body.map((p, i) => (
        <P key={i}>{p}</P>
      ))}
      {cta ? <CTA href={absolute(cta.href)}>{cta.label}</CTA> : null}
    </EmailLayout>
  );
}

NotificationEmail.PreviewProps = {
  name: "Ada",
  eyebrow: "New course",
  title: "The Persuasion Lab is open.",
  body: [
    "Five lessons on the ethical science of influence: how to be heard, trusted and followed without tricks.",
    "Like every Pintevact course, it stops to ask how each idea shows up in your own conversations.",
  ],
  cta: { label: "See the course", href: "/courses/the-persuasion-lab" },
  band: "violet",
  unsubscribeUrl: "https://pintevact.com/unsubscribe?t=example",
} satisfies NotificationEmailProps;
