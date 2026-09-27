import { Section, Text } from "@react-email/components";
import { brand, CTA, EmailLayout, Heading, P, siteUrl } from "./components/layout";

export type WelcomeEmailProps = { name?: string | null };

const steps = [
  { n: "01", title: "Meet Your Mind", body: "Start the free course — 30 minutes that change how you see every decision." },
  { n: "02", title: "Talk back to the video", body: "Our lessons pause to quiz you, poll you and ask for your reflections." },
  { n: "03", title: "Watch your constellation grow", body: "Every lesson lights a star on your personal mind map." },
];

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to Pintevact — your mind has been waiting for this">
      <Heading eyebrow="Welcome aboard">{name ? `${name}, ` : ""}welcome to the most interesting subject there is: you.</Heading>
      <P>Pintevact isn&apos;t a library of videos you&apos;ll never finish. It&apos;s a conversation — with research, with your own reflections, and with the person you&apos;re becoming.</P>
      {steps.map((s) => (
        <Section key={s.n} style={{ margin: "0 0 12px", padding: "14px 18px", backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #d8cfbd" }}>
          <Text style={{ margin: 0, fontFamily: brand.mono, fontSize: 11, color: brand.ember, letterSpacing: 2 }}>{s.n}</Text>
          <Text style={{ margin: "2px 0 0", fontFamily: brand.display, fontSize: 19 }}>{s.title}</Text>
          <Text style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "22px", color: brand.ink3 }}>{s.body}</Text>
        </Section>
      ))}
      <CTA href={`${siteUrl()}/learn/meet-your-mind`}>Start the free course</CTA>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = { name: "Ada" } satisfies WelcomeEmailProps;
