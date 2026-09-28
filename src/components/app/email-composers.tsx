"use client";

import { useActionState } from "react";
import { sendLearnerAnnouncement, sendNewsletter } from "@/app/(app)/admin/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import type { FormState } from "@/lib/validation";

function Status({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={state.ok ? "text-sm font-semibold text-accent-ink" : "text-sm font-semibold text-danger"}>
      {state.message}
    </p>
  );
}

function Field({ scope, name, label, state, hint, multiline, rows, placeholder }: { scope: string; name: string; label: string; state: FormState; hint?: string; multiline?: boolean; rows?: number; placeholder?: string }) {
  const error = state.errors?.[name];
  const id = `${scope}-${name}`;
  const props = { id, name, defaultValue: state.values?.[name] ?? "", placeholder, "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${id}-error` : undefined };
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {multiline ? <Textarea rows={rows} {...props} /> : <Input {...props} />}
      {hint ? <p className="mt-1.5 text-xs text-subtle">{hint}</p> : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function CtaFields({ scope, state }: { scope: string; state: FormState }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field scope={scope} name="ctaLabel" label="Button label (optional)" state={state} placeholder="Browse courses" />
      <Field scope={scope} name="ctaHref" label="Button link" state={state} placeholder="/courses" hint="A path on Pintevact, or an https:// link." />
    </div>
  );
}

function Actions({ pending, audience, noun }: { pending: boolean; audience: number; noun: [string, string] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" name="intent" value="test" variant="outline" disabled={pending}>
        Send test to me
      </Button>
      <Button
        type="submit"
        name="intent"
        value="send"
        variant="primary"
        loading={pending}
        disabled={!audience}
        onClick={(e) => {
          if (!confirm(`Send this to ${audience} ${audience === 1 ? noun[0] : noun[1]}? This can't be undone.`)) e.preventDefault();
        }}
      >
        Send to {audience.toLocaleString()} {audience === 1 ? noun[0] : noun[1]}
      </Button>
    </div>
  );
}

// Remounting on a successful send clears the fields; a failed send keeps what was typed.
export function NewsletterComposer({ subscribers }: { subscribers: number }) {
  const [state, action, pending] = useActionState(sendNewsletter, {});
  return (
    <form action={action} key={state.ok && !state.values ? state.message : "draft"} className="space-y-5">
      <Field scope="letter" name="subject" label="Subject line" state={state} placeholder="The two-minute rule for hard feelings" />
      <Field scope="letter" name="title" label="Headline" state={state} />
      <Field scope="letter" name="idea" label="The idea" state={state} multiline rows={8} hint="Separate paragraphs with a blank line." />
      <Field scope="letter" name="experiment" label="This week's experiment" state={state} multiline rows={3} />
      <Field scope="letter" name="question" label="A question to sit with (optional)" state={state} />
      <CtaFields scope="letter" state={state} />
      <Actions pending={pending} audience={subscribers} noun={["subscriber", "subscribers"]} />
      <Status state={state} />
    </form>
  );
}

export function AnnouncementComposer({ learners }: { learners: number }) {
  const [state, action, pending] = useActionState(sendLearnerAnnouncement, {});
  return (
    <form action={action} key={state.ok && !state.values ? state.message : "draft"} className="space-y-5">
      <Field scope="notice" name="subject" label="Subject line" state={state} placeholder="A new course just opened" />
      <div className="grid gap-5 md:grid-cols-[1fr_2fr]">
        <Field scope="notice" name="eyebrow" label="Label" state={state} placeholder="New course" />
        <Field scope="notice" name="title" label="Headline" state={state} />
      </div>
      <Field scope="notice" name="body" label="Message" state={state} multiline rows={6} hint="Each learner is greeted by name. Separate paragraphs with a blank line." />
      <CtaFields scope="notice" state={state} />
      <Actions pending={pending} audience={learners} noun={["learner", "learners"]} />
      <Status state={state} />
    </form>
  );
}
