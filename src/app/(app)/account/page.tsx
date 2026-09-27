import type { Metadata } from "next";
import { Avatar } from "@/components/ui/avatar";
import { AccountTabs } from "@/components/app/account-tabs";
import { DeleteAccountForm, EmailForm, PasswordForm, ProfileForm } from "@/components/app/account-forms";
import { requireViewer } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };

function Section({ title, description, children, danger }: { title: string; description: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`grid gap-6 rounded-2xl border p-6 sm:p-8 lg:grid-cols-[16rem_1fr] ${danger ? "border-danger/40" : "border-line bg-raised"}`}>
      <div>
        <h2 className={`text-lg ${danger ? "text-danger" : ""}`}>{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default async function AccountPage() {
  const viewer = await requireViewer();
  const p = viewer.profile;
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <Avatar name={p.fullName ?? viewer.email} size={72} />
          <div>
            <h1 className="text-3xl tracking-tight sm:text-4xl">{p.fullName ?? "Your account"}</h1>
            <p className="text-muted">
              {p.headline ?? viewer.email} · member since {formatDate(p.createdAt, { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <AccountTabs active="profile" />
      </header>
      <Section title="Profile" description="How you appear across Pintevact and on certificates.">
        <ProfileForm fullName={p.fullName ?? ""} headline={p.headline ?? ""} emailOptIn={p.emailOptIn} />
      </Section>
      <Section title="Email" description="We'll send a confirmation link before anything changes.">
        <EmailForm email={viewer.email} />
      </Section>
      <Section title="Password" description="Use 8+ characters with at least one letter and number.">
        <PasswordForm />
      </Section>
      <Section title="Danger zone" description="Permanently remove your account and data." danger>
        <DeleteAccountForm />
      </Section>
    </div>
  );
}
