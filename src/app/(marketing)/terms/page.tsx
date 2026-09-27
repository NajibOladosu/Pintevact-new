import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="September 27, 2026"
      sections={[
        { heading: "Agreement", body: ["By creating an account or using Pintevact you agree to these terms. If you don't agree, please don't use the service."] },
        { heading: "Educational purpose", body: ["Pintevact provides psychology education. It is not medical advice, diagnosis or therapy, and it is not a substitute for care from a qualified professional. If you are in crisis, contact local emergency services."] },
        { heading: "Your account", body: ["You're responsible for keeping your login secure and for activity on your account. You must be at least 16 years old to use Pintevact."] },
        { heading: "Purchases & memberships", body: ["Single-course purchases grant lifetime personal access to that course for as long as Pintevact operates it. All-Access memberships renew automatically until cancelled; cancellation takes effect at the end of the current billing period.", "Single-course purchases may be refunded within 30 days. Payments are processed securely by Stripe."] },
        { heading: "Acceptable use", body: ["Don't share your account, redistribute course videos, scrape content, or attempt to circumvent access controls."] },
        { heading: "Your content", body: ["Reflections and notes you write belong to you. We store them only to provide the service and never publish them."] },
        { heading: "Changes", body: ["We may update these terms. We'll notify you of material changes by email or in the app."] },
        { heading: "Contact", body: ["Questions? Email hello@pintevact.com."] },
      ]}
    />
  );
}
