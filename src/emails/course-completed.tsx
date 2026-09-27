import { Section, Text } from "@react-email/components";
import { brand, CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type CourseCompletedEmailProps = { name?: string | null; courseTitle: string; certificateId: string; xpEarned: number };

export default function CourseCompletedEmail({ name, courseTitle, certificateId, xpEarned }: CourseCompletedEmailProps) {
  return (
    <EmailLayout preview={`You completed ${courseTitle}, your certificate is ready`}>
      <Heading>You did the work{name ? `, ${name}` : ""}.</Heading>
      <P>
        You&apos;ve completed <strong>{courseTitle}</strong>. Most people who start online courses never finish them. You&apos;re not most people.
      </P>
      <Section style={{ backgroundColor: brand.violet, color: brand.onViolet, borderRadius: 12, padding: "24px 24px", margin: "8px 0 20px" }}>
        <Text style={{ margin: 0, color: brand.onVioletMuted, fontSize: 13 }}>Certificate of completion</Text>
        <Text style={{ margin: "6px 0 4px", color: brand.onViolet, fontSize: 24, fontWeight: 600 }}>{courseTitle}</Text>
        <Text style={{ margin: 0, color: brand.onVioletMuted, fontSize: 14 }}>+{xpEarned} XP</Text>
      </Section>
      <P>Share it, frame it, or simply let it remind you: you are someone who follows through.</P>
      <CTA href={`${siteUrl()}/certificates/${certificateId}`}>View my certificate</CTA>
    </EmailLayout>
  );
}

CourseCompletedEmail.PreviewProps = { name: "Ada", courseTitle: "Emotional Alchemy", certificateId: "00000000-0000-4000-8000-000000000000", xpEarned: 250 } satisfies CourseCompletedEmailProps;
