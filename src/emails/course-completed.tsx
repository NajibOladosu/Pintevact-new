import { Section, Text } from "@react-email/components";
import { brand, CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type CourseCompletedEmailProps = { name?: string | null; courseTitle: string; certificateId: string; xpEarned: number };

export default function CourseCompletedEmail({ name, courseTitle, certificateId, xpEarned }: CourseCompletedEmailProps) {
  return (
    <EmailLayout preview={`You completed ${courseTitle} — your certificate is ready`}>
      <Heading eyebrow="Course complete">You did the work{name ? `, ${name}` : ""}.</Heading>
      <P>
        You&apos;ve completed <strong>{courseTitle}</strong>. Most people who start online courses never finish them. You&apos;re not most people.
      </P>
      <Section style={{ textAlign: "center", backgroundColor: brand.night, borderRadius: 20, padding: "28px 20px", margin: "8px 0 20px" }}>
        <Text style={{ margin: 0, fontFamily: brand.mono, color: brand.lucid, fontSize: 11, letterSpacing: 3 }}>CERTIFICATE OF INTEGRATION</Text>
        <Text style={{ margin: "10px 0 4px", fontFamily: brand.display, fontStyle: "italic", color: brand.paper, fontSize: 26 }}>{courseTitle}</Text>
        <Text style={{ margin: 0, color: brand.ember, fontSize: 14, fontWeight: 700 }}>+{xpEarned} XP</Text>
      </Section>
      <P>Share it, frame it, or simply let it remind you: you are someone who follows through.</P>
      <CTA href={`${siteUrl()}/certificates/${certificateId}`}>View my certificate</CTA>
    </EmailLayout>
  );
}

CourseCompletedEmail.PreviewProps = { name: "Ada", courseTitle: "Emotional Alchemy", certificateId: "00000000-0000-4000-8000-000000000000", xpEarned: 250 } satisfies CourseCompletedEmailProps;
