"use client";

import { useActionState } from "react";
import { ArrowUpRight } from "@/components/icons";
import { submitContact } from "@/app/(marketing)/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
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
      <div role="status" className="self-start rounded-[2rem] bg-violet p-10 text-on-violet shadow-frame">
        <p className="h-sub">Message received.</p>
        <p className="mt-3 text-on-violet-muted">{state.message}</p>
      </div>
    );
  }
  const v = state.values ?? {};
  return (
    <form action={action} noValidate className="space-y-5 self-start rounded-[2rem] bg-raised p-7 shadow-frame ring-1 ring-line sm:p-11">
      <h2 className="h-sub pb-2">What is on your mind?</h2>
      {state.message ? (
        <p role="alert" className="rounded-[0.85rem] border border-danger/40 px-4 py-3 text-sm text-danger">
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
        <Select
          id="topic"
          name="topic"
          defaultValue={v.topic ?? (contactTopics.includes(defaultTopic as never) ? defaultTopic : "general")}
        >
          {contactTopics.map((t) => (
            <option key={t} value={t}>
              {topicLabels[t]}
            </option>
          ))}
        </Select>
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
      <p className="pt-2 text-xs text-muted">We use these details only to reply to your message.</p>
      <Button type="submit" variant="secondary" size="lg" loading={pending} className="w-full justify-between">
        Send message <ArrowUpRight size={15} aria-hidden />
      </Button>
    </form>
  );
}
