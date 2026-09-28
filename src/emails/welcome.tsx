import { CTA, EmailLayout, Heading, P, siteUrl, Steps } from "./_components/layout";

export type WelcomeEmailProps = { name?: string | null };

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout band="amber" preview="Your first lesson is waiting. Here's how Pintevact works.">
      <Heading eyebrow="Welcome to Pintevact">{name ? `${name}, welcome to the most interesting subject there is: you.` : "Welcome to the most interesting subject there is: you."}</Heading>
      <P>Pintevact isn&apos;t a library of videos you&apos;ll never finish. It&apos;s a conversation with research, with your own reflections, and with the person you&apos;re becoming.</P>
      <Steps
        items={[
          { title: "Start with Meet Your Mind", body: "The free course: four short lessons that change how you see your next decision." },
          { title: "Talk back to the video", body: "Lessons pause to quiz you, poll you and ask how an idea shows up in your life." },
          { title: "Watch it add up", body: "Every answer earns XP, and your reflections stay private in your vault." },
        ]}
      />
      <CTA href={`${siteUrl()}/learn/meet-your-mind`}>Start the free course</CTA>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = { name: "Ada" } satisfies WelcomeEmailProps;
