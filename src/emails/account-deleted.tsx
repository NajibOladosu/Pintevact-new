import { CTA, EmailLayout, Heading, P, siteUrl, Small } from "./_components/layout";

export type AccountDeletedEmailProps = { name?: string | null };

export default function AccountDeletedEmail({ name }: AccountDeletedEmailProps) {
  return (
    <EmailLayout band="dusk" preview="Your Pintevact account and everything in it has been deleted." reason="You're receiving this final email because your Pintevact account was deleted.">
      <Heading eyebrow="Account deleted">{name ? `Goodbye for now, ${name}.` : "Goodbye for now."}</Heading>
      <P>Your Pintevact account has been deleted, along with your progress, reflections, notes and certificates. Any All-Access membership was canceled, so you won&apos;t be charged again.</P>
      <P>Thank you for spending some of your attention on understanding yourself. The door stays open if you ever want to come back.</P>
      <CTA href={`${siteUrl()}/signup`} tone="ink">
        Start fresh
      </CTA>
      <Small>Didn&apos;t delete your account? Reply to this email straight away.</Small>
    </EmailLayout>
  );
}

AccountDeletedEmail.PreviewProps = { name: "Ada" } satisfies AccountDeletedEmailProps;
