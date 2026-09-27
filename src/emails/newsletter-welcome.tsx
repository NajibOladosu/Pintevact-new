import { CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export default function NewsletterWelcomeEmail() {
  return (
    <EmailLayout preview="You're on the list — one psychology insight every week" footerNote="Unsubscribe any time with one click.">
      <Heading eyebrow="The Pintevact Letter">One idea a week. Zero fluff.</Heading>
      <P>Every Thursday you&apos;ll get one research-backed psychological insight and a two-minute experiment to try on yourself.</P>
      <P>Start with our most-read piece while you wait for the first issue.</P>
      <CTA href={`${siteUrl()}/journal`}>Read the Journal</CTA>
    </EmailLayout>
  );
}
