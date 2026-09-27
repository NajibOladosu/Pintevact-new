import { Text } from "@react-email/components";
import { brand, Callout, CTA, EmailLayout, Heading, P, siteUrl } from "./components/layout";

export type StreakReminderEmailProps = { name?: string | null; streak: number; nextLessonTitle: string; nextLessonUrl: string };

export default function StreakReminderEmail({ name, streak, nextLessonTitle, nextLessonUrl }: StreakReminderEmailProps) {
  return (
    <EmailLayout preview={`Your ${streak}-day streak ends at midnight`} footerNote="You can turn off reminder emails in your account settings.">
      <Heading eyebrow={`${streak}-day streak`}>Don&apos;t let the flame go out{name ? `, ${name}` : ""}.</Heading>
      <P>Loss aversion is real — and today, it&apos;s working for you. One lesson keeps your streak alive.</P>
      <Callout tone="ember">
        <Text style={{ margin: 0, fontSize: 12, fontFamily: brand.mono, letterSpacing: 2 }}>UP NEXT</Text>
        <Text style={{ margin: "4px 0 0", fontSize: 18, fontFamily: brand.display }}>{nextLessonTitle}</Text>
      </Callout>
      <CTA href={nextLessonUrl.startsWith("http") ? nextLessonUrl : `${siteUrl()}${nextLessonUrl}`}>Keep my streak</CTA>
    </EmailLayout>
  );
}

StreakReminderEmail.PreviewProps = { name: "Ada", streak: 6, nextLessonTitle: "You Are Not Your Thoughts", nextLessonUrl: "/learn/emotional-alchemy/you-are-not-your-thoughts" } satisfies StreakReminderEmailProps;
