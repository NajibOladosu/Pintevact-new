import { absolute, Callout, CalloutText, CTA, EmailLayout, Heading, P } from "./_components/layout";

export type StreakReminderEmailProps = { name?: string | null; streak: number; nextLessonTitle: string; nextLessonUrl: string; unsubscribeUrl?: string };

export default function StreakReminderEmail({ name, streak, nextLessonTitle, nextLessonUrl, unsubscribeUrl }: StreakReminderEmailProps) {
  return (
    <EmailLayout
      band="amber"
      preview={`Your ${streak}-day streak ends at midnight. One short lesson keeps it going.`}
      reason="You're receiving this reminder because learning emails are on in your Pintevact account."
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading eyebrow={`${streak}-day streak`}>{name ? `Keep the flame going, ${name}.` : "Keep the flame going."}</Heading>
      <P>Loss aversion is real, and tonight it&apos;s working for you. One lesson, about eight minutes, keeps your streak alive.</P>
      <Callout eyebrow="Up next">
        <CalloutText large>{nextLessonTitle}</CalloutText>
      </Callout>
      <CTA href={absolute(nextLessonUrl)}>Keep my streak</CTA>
    </EmailLayout>
  );
}

StreakReminderEmail.PreviewProps = { name: "Ada", streak: 6, nextLessonTitle: "You Are Not Your Thoughts", nextLessonUrl: "/learn/emotional-alchemy/you-are-not-your-thoughts", unsubscribeUrl: "https://pintevact.com/unsubscribe?t=example" } satisfies StreakReminderEmailProps;
