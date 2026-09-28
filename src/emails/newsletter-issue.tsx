import { Section, Text } from "@react-email/components";
import { absolute, brand, Callout, CalloutText, CTA, Divider, EmailLayout, Eyebrow, Heading, P } from "./_components/layout";

export type NewsletterIssueEmailProps = {
  issueNumber?: number;
  /** Headline of the idea. */
  title: string;
  /** The idea, as paragraphs. */
  idea: string[];
  /** A two-minute experiment to try this week. */
  experiment: string;
  /** A question to sit with. */
  question?: string;
  cta?: { label: string; href: string };
  unsubscribeUrl?: string;
};

/** The Thursday letter: one idea, one experiment, one question. */
export default function NewsletterIssueEmail({ issueNumber, title, idea, experiment, question, cta, unsubscribeUrl }: NewsletterIssueEmailProps) {
  return (
    <EmailLayout
      band="violet"
      preview={idea[0] ?? title}
      reason="You're receiving this because you subscribed to the Pintevact Thursday letter."
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading eyebrow={issueNumber ? `The Thursday letter · No. ${issueNumber}` : "The Thursday letter"}>{title}</Heading>
      {idea.map((p, i) => (
        <P key={i}>{p}</P>
      ))}
      <Section style={{ backgroundColor: brand.paper, border: `1px solid ${brand.line}`, borderRadius: 22, padding: "22px 26px", margin: "10px 0 18px" }}>
        <Eyebrow>Try this week</Eyebrow>
        <Text style={{ margin: 0, fontSize: 17, lineHeight: "26px", color: brand.ink }}>{experiment}</Text>
      </Section>
      {question ? (
        <Callout eyebrow="A question to sit with">
          <CalloutText large>{question}</CalloutText>
        </Callout>
      ) : null}
      {cta ? (
        <>
          <Divider />
          <P muted>Want to practise this, not just read it?</P>
          <CTA href={absolute(cta.href)}>{cta.label}</CTA>
        </>
      ) : null}
    </EmailLayout>
  );
}

NewsletterIssueEmail.PreviewProps = {
  issueNumber: 12,
  title: "Why you remember the one bad review.",
  idea: [
    "Negative events carry more psychological weight than positive ones of the same size. Psychologists call it negativity bias, and it made sense when missing a threat cost more than missing a meal.",
    "Today it means one critical comment can outweigh ten kind ones, unless you notice it happening.",
  ],
  experiment: "Tonight, write down three things that went fine today and one that didn't. Notice which one your mind wants to replay.",
  question: "Whose criticism do you still carry that you'd never accept from a stranger?",
  cta: { label: "Start Emotional Alchemy", href: "/courses/emotional-alchemy" },
  unsubscribeUrl: "https://pintevact.com/unsubscribe?t=example",
} satisfies NewsletterIssueEmailProps;
