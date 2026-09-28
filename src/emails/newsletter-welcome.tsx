import { CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export default function NewsletterWelcomeEmail() {
  return (
    <EmailLayout preview="You're on the list, one psychology insight every week" footerNote="Unsubscribe any time with one click.">
      <Heading eyebrow="The Thursday letter">One idea a week. Zero fluff.</Heading>
      <P>Every Thursday you&apos;ll get one research-backed psychological insight and a two-minute experiment to try on yourself.</P>
      <P>While you wait for the first issue, take a look around the courses.</P>
      <CTA href={`${siteUrl()}/courses`}>Browse the courses</CTA>
    </EmailLayout>
  );
}
