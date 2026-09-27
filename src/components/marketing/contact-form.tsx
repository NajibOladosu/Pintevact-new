"use client";

import { useActionState } from "react";
import { Send } from "@/components/icons";
import { submitContact } from "@/app/(marketing)/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { contactTopics } from "@/lib/validation";

const topicLabels: Record<(typeof contactTopics)[number], string> = {
  general: "Just saying hi",
  courses: "Courses & content",
  billing: "Billing & payments",
  teams: "Pintevact for teams",
  press: "Press & partnerships",
};

export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const [state, action, pending] = useActionState(submitContact, {});
  if (state.ok) {
    return (
      <div role="status" className="rounded-2xl bg-violet p-8 text-on-violet">
        <p className="text-2xl font-semibold tracking-tight">Message received.</p>
        <p className="mt-2 text-on-violet-muted">{state.message}</p>
      </div>
    );
  }
  const v = state.values ?? {};
  return (
    <form action={action} noValidate className="space-y-5 rounded-2xl border border-line bg-raised p-6 sm:p-8">
      {state.message ? (
        <p role="alert" className="rounded-[10px] border border-danger/40 p-3 text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" autoComplete="name" defaultValue={v.name} aria-invalid={!!state.errors?.name} aria-describedby="name-error" />
          <FieldError id="name-error" message={state.errors?.name} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} aria-invalid={!!state.errors?.email} aria-describedby="email-error" />
          <FieldError id="email-error" message={state.errors?.email} />
        </div>
      </div>
      <div>
        <Label htmlFor="topic">What&apos;s it about?</Label>
        <select
          id="topic"
          name="topic"
          defaultValue={v.topic ?? (contactTopics.includes(defaultTopic as never) ? defaultTopic : "general")}
          className="h-11 w-full rounded-[10px] border border-line-strong bg-raised px-3.5 text-fg focus:border-fg focus:outline-none"
        >
          {contactTopics.map((t) => (
            <option key={t} value={t}>
              {topicLabels[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={6} defaultValue={v.message} aria-invalid={!!state.errors?.message} aria-describedby="message-error" />
        <FieldError id="message-error" message={state.errors?.message} />
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" variant="secondary" loading={pending} className="w-full sm:w-auto">
        Send message <Send size={16} />
      </Button>
    </form>
  );
}
