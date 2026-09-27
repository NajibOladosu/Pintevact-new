import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 27, 2026"
      sections={[
        { heading: "What we collect", body: ["Account details (name, email), learning activity (progress, quiz answers, poll votes, self-ratings), content you write (reflections, notes) and billing references from Stripe. We never store full card numbers."] },
        { heading: "How we use it", body: ["To run your courses, show your progress, send the emails you've opted into, and improve lessons using aggregated, anonymous statistics (for example, poll results)."] },
        { heading: "Your reflections are private", body: ["Reflections and notes are visible only to you. They are protected by row-level security in our database and are never used for marketing or shared with third parties."] },
        { heading: "Processors", body: ["Supabase (database & authentication), Stripe (payments), Resend (email) and Bunny.net (video streaming). Each processes data only on our behalf."] },
        { heading: "Your choices", body: ["You can update your details, turn off non-essential emails, export your data or delete your account at any time from your account page or by emailing us."] },
        { heading: "Contact", body: ["privacy@pintevact.com"] },
      ]}
    />
  );
}
