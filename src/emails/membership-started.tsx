import { Callout, CalloutText, CTA, Details, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type MembershipStartedEmailProps = { name?: string | null; plan: "monthly" | "yearly"; amount: string; renewsOn: string };

export default function MembershipStartedEmail({ name, plan, amount, renewsOn }: MembershipStartedEmailProps) {
  return (
    <EmailLayout band="violet" preview="All-Access is live. Every course, including the next ones, is yours." footerNote="Manage or cancel any time from Account → Billing." reason="You're receiving this because you started an All-Access membership.">
      <Heading eyebrow="All-Access">{name ? `Every door is open, ${name}.` : "Every door is open."}</Heading>
      <P>Your All-Access membership is live. Every current course, and every new one we release, is now part of your library.</P>
      <Details rows={[["Plan", plan === "yearly" ? "Yearly" : "Monthly"], ["Price", amount], ["Next renewal", renewsOn]]} />
      <Callout eyebrow="Where to begin">
        <CalloutText>Too many choices can freeze us, so pick just one course to start this week. Depth beats breadth.</CalloutText>
      </Callout>
      <CTA href={`${siteUrl()}/courses`}>Choose my first course</CTA>
    </EmailLayout>
  );
}

MembershipStartedEmail.PreviewProps = { name: "Ada", plan: "yearly", amount: "$240.00 / year", renewsOn: "Sep 28, 2027" } satisfies MembershipStartedEmailProps;
