"use server";

import { getStore } from "@/lib/data";
import { notify } from "@/lib/notifications";
import { contactSchema, emailSchema, fieldErrors, type FormState } from "@/lib/validation";

export async function subscribeNewsletter(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, errors: { email: parsed.error.issues[0].message } };
  try {
    const { token, isNew } = await getStore().subscribeNewsletter(parsed.data);
    if (isNew) await notify.newsletterWelcome(parsed.data, token);
    return { ok: true, message: "You're in. First letter lands Thursday." };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function submitContact(_: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: raw };
  const { company: _honeypot, ...message } = parsed.data;
  void _honeypot;
  try {
    await getStore().saveContactMessage(message);
    await notify.contact(message);
    return { ok: true, message: `Thanks, ${message.name}! We'll reply to ${message.email} within 1-2 working days.` };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "We couldn't send your message. Please email us directly.", values: raw };
  }
}
