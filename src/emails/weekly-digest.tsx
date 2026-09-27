import { Column, Row, Section, Text } from "@react-email/components";
import { brand, CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type WeeklyDigestEmailProps = {
  name?: string | null;
  xp: number;
  lessons: number;
  reflections: number;
  levelName: string;
  insight: string;
};

export default function WeeklyDigestEmail({ name, xp, lessons, reflections, levelName, insight }: WeeklyDigestEmailProps) {
  const stat = (value: string | number, label: string) => (
    <Column style={{ textAlign: "center", padding: "12px 4px" }}>
      <Text style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{value}</Text>
      <Text style={{ margin: 0, fontSize: 12, color: brand.ink3 }}>{label}</Text>
    </Column>
  );
  return (
    <EmailLayout preview={`Your week in review: ${xp} XP, ${lessons} lessons`} footerNote="Weekly digests arrive every Sunday. Turn them off in your account settings.">
      <Heading eyebrow="Your week">Here&apos;s what you learned about yourself{name ? `, ${name}` : ""}.</Heading>
      <Section style={{ backgroundColor: "#f8f2ea", borderRadius: 16, border: "1px solid #e2d9cc", margin: "0 0 20px" }}>
        <Row>
          {stat(xp, "XP")}
          {stat(lessons, "Lessons")}
          {stat(reflections, "Reflections")}
        </Row>
      </Section>
      <P>
        You&apos;re currently a <strong>{levelName}</strong>. {insight}
      </P>
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
  insight: "People who reflect in writing after learning retain up to 23% more (Di Stefano et al.). Your reflections are compounding.",
} satisfies WeeklyDigestEmailProps;
