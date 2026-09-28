import { CTA, EmailLayout, Heading, P, siteUrl, Steps } from "./_components/layout";

export type NewsletterWelcomeEmailProps = { unsubscribeUrl?: string };

export default function NewsletterWelcomeEmail({ unsubscribeUrl }: NewsletterWelcomeEmailProps) {
  return (
    <EmailLayout
      band="dawn"
      preview="You're on the list: one idea from psychology every Thursday."
      reason="You're receiving this because you signed up for the Pintevact Thursday letter."
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading eyebrow="The Thursday letter">One idea a week. Zero fluff.</Heading>
      <P>Every Thursday you&apos;ll get a short letter built the same way each time:</P>
      <Steps
        items={[
          { title: "One idea", body: "A research finding about why we think, feel and act the way we do." },
          { title: "One experiment", body: "A two-minute way to try it on yourself this week." },
          { title: "One question", body: "Something worth sitting with, the way our lessons do." },
        ]}
      />
      <P>While you wait for the first issue, take a look around the courses.</P>
      <CTA href={`${siteUrl()}/courses`}>Browse the courses</CTA>
    </EmailLayout>
  );
}

NewsletterWelcomeEmail.PreviewProps = { unsubscribeUrl: "https://pintevact.com/unsubscribe?t=example" } satisfies NewsletterWelcomeEmailProps;
