import { Section, Text } from "@react-email/components";
import { brand, CTA, EmailLayout, Eyebrow, Heading, P, siteUrl } from "./_components/layout";

export type CourseCompletedEmailProps = { name?: string | null; courseTitle: string; certificateId: string; xpEarned: number };

export default function CourseCompletedEmail({ name, courseTitle, certificateId, xpEarned }: CourseCompletedEmailProps) {
  return (
    <EmailLayout band="dawn" preview={`You finished ${courseTitle}. Your certificate is ready.`} reason="You're receiving this because you completed a course on Pintevact.">
      <Heading eyebrow="Course complete">{name ? `You did the work, ${name}.` : "You did the work."}</Heading>
      <P>
        You&apos;ve completed <strong>{courseTitle}</strong>. Most people who start an online course never finish it. You did, one honest answer at a time.
      </P>
      {/* A small certificate card: violet, like the answered side of a checkpoint. */}
      <Section style={{ backgroundColor: brand.violet, borderRadius: 22, padding: "26px 28px", margin: "6px 0 20px" }}>
        <Eyebrow color={brand.onVioletMuted}>Certificate of completion</Eyebrow>
        <Text style={{ margin: "0 0 6px", fontSize: 26, lineHeight: "30px", fontWeight: 600, letterSpacing: "-0.03em", color: brand.onViolet }}>{courseTitle}</Text>
        <Text style={{ margin: 0, fontSize: 14, color: brand.onVioletMuted }}>
          {name ?? "Pintevact learner"} · <span style={{ color: "#ff9a74", fontWeight: 600 }}>+{xpEarned} XP</span>
        </Text>
      </Section>
      <P>Share it, print it, or simply let it remind you that you&apos;re someone who follows through.</P>
      <CTA href={`${siteUrl()}/certificates/${certificateId}`}>View my certificate</CTA>
    </EmailLayout>
  );
}

CourseCompletedEmail.PreviewProps = { name: "Ada", courseTitle: "Emotional Alchemy", certificateId: "00000000-0000-4000-8000-000000000000", xpEarned: 250 } satisfies CourseCompletedEmailProps;
