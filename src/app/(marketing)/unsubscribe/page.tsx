import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { applyUnsubscribe, parseUnsubscribeToken } from "@/lib/unsubscribe";
import { UnsubscribeButton } from "./unsubscribe-button";

export const metadata: Metadata = { title: "Email preferences", robots: { index: false } };

async function unsubscribe(formData: FormData) {
  "use server";
  const { redirect } = await import("next/navigation");
  const token = String(formData.get("t") ?? "");
  const done = await applyUnsubscribe(token);
  redirect(done ? `/unsubscribe?done=${done}` : "/unsubscribe?invalid=1");
}

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string; done?: string; invalid?: string }> }) {
  const { t, done, invalid } = await searchParams;
  const parsed = t ? parseUnsubscribeToken(t) : null;

  const eyebrow = "Email preferences";
  let title = "This link doesn't look right.";
  let lead = "It may be incomplete or out of date. You can manage every email from your account settings.";
  let action: React.ReactNode = (
    <Link href="/account" className={buttonClasses({ size: "lg" })}>
      Open my account <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
    </Link>
  );

  if (done === "newsletter") {
    title = "You're off the Thursday list.";
    lead = "No more letters from us. If you change your mind, the sign-up form is at the bottom of every page.";
    action = (
      <Link href="/" className={buttonClasses({ variant: "outline", size: "lg" })}>
        Back to Pintevact
      </Link>
    );
  } else if (done === "learner") {
    title = "Reminders are off.";
    lead = "You won't get streak reminders, weekly digests or announcements. Receipts and security emails will still arrive. You can switch learning emails back on in your account.";
    action = (
      <Link href="/account" className={buttonClasses({ variant: "outline", size: "lg" })}>
        Email settings
      </Link>
    );
  } else if (parsed && !invalid) {
    title = parsed.kind === "newsletter" ? "Leave the Thursday letter?" : "Turn off learning emails?";
    lead =
      parsed.kind === "newsletter"
        ? "You'll stop receiving the weekly letter. Nothing else changes."
        : "You'll stop getting streak reminders, weekly digests and announcements. Receipts and security emails still arrive.";
    action = (
      <form action={unsubscribe}>
        <input type="hidden" name="t" value={t} />
        <UnsubscribeButton />
      </form>
    );
  }

  return (
    <div className="shell pt-8 sm:pt-14">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-raised p-8 text-center shadow-frame ring-1 ring-line sm:p-14">
        <span className="eyebrow text-accent-ink">{eyebrow}</span>
        <h1 className="h-sub mx-auto mt-5 max-w-[20ch]">{title}</h1>
        <p className="mx-auto mt-5 max-w-[46ch] leading-relaxed text-muted">{lead}</p>
        <div className="mt-9 flex justify-center">{action}</div>
      </div>
    </div>
  );
}
