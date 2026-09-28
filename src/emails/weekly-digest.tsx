import { Callout, CalloutText, CTA, EmailLayout, Heading, P, siteUrl, Stats } from "./_components/layout";

export type WeeklyDigestEmailProps = {
  name?: string | null;
  xp: number;
  lessons: number;
  reflections: number;
  levelName: string;
  insight: string;
  unsubscribeUrl?: string;
};

export default function WeeklyDigestEmail({ name, xp, lessons, reflections, levelName, insight, unsubscribeUrl }: WeeklyDigestEmailProps) {
  return (
    <EmailLayout
      band="dusk"
      preview={`Your week: ${xp} XP, ${lessons} ${lessons === 1 ? "lesson" : "lessons"}, ${reflections} ${reflections === 1 ? "reflection" : "reflections"}.`}
      reason="You're receiving this Sunday digest because learning emails are on in your Pintevact account."
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading eyebrow="Your week">{name ? `Here's what you noticed this week, ${name}.` : "Here's what you noticed this week."}</Heading>
      <Stats
        items={[
          { value: xp, label: "XP" },
          { value: lessons, label: lessons === 1 ? "Lesson" : "Lessons" },
          { value: reflections, label: reflections === 1 ? "Reflection" : "Reflections" },
        ]}
      />
      <P>
        Your current level: <strong>{levelName}</strong>. Keep answering honestly and the next one arrives on its own.
      </P>
      <Callout eyebrow="Why it works">
        <CalloutText>{insight}</CalloutText>
      </Callout>
      <CTA href={`${siteUrl()}/dashboard`}>Open my dashboard</CTA>
    </EmailLayout>
  );
}

WeeklyDigestEmail.PreviewProps = {
  name: "Ada",
  xp: 340,
  lessons: 4,
  reflections: 6,
  levelName: "Observer",
  insight: "People who reflect in writing after learning retain noticeably more of it. Your reflections are compounding.",
  unsubscribeUrl: "https://pintevact.com/unsubscribe?t=example",
} satisfies WeeklyDigestEmailProps;
