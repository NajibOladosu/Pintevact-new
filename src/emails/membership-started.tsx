import { Text } from "@react-email/components";
import { Callout, CTA, EmailLayout, Heading, P, siteUrl } from "./_components/layout";

export type MembershipStartedEmailProps = { name?: string | null; plan: "monthly" | "yearly"; amount: string; renewsOn: string };

export default function MembershipStartedEmail({ name, plan, amount, renewsOn }: MembershipStartedEmailProps) {
  return (
    <EmailLayout preview="All-Access unlocked — every course is now yours" footerNote="Manage or cancel any time from Account → Billing.">
      <Heading eyebrow="All-Access">Every door is open{name ? `, ${name}` : ""}.</Heading>
      <P>Your All-Access membership is live. Every current course — and every new one we release — is now part of your library.</P>
      <Callout>
        <Text style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>
          <strong>Plan:</strong> {plan === "yearly" ? "Yearly" : "Monthly"} · {amount}
          <br />
          <strong>Next renewal:</strong> {renewsOn}
        </Text>
      </Callout>
      <P>A suggestion from the research on choice overload: pick just one course to start this week. Depth beats breadth.</P>
      <CTA href={`${siteUrl()}/courses`}>Choose my first course</CTA>
    </EmailLayout>
  );
}

MembershipStartedEmail.PreviewProps = { name: "Ada", plan: "yearly", amount: "$240.00 / year", renewsOn: "Sep 27, 2027" } satisfies MembershipStartedEmailProps;
