import "server-only";
import type { ReactElement } from "react";
import { render, toPlainText } from "@react-email/render";
import { Resend } from "resend";
import { env, isResendConfigured } from "@/lib/env";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult = { ok: true; id: string | null; skipped?: boolean } | { ok: false; error: string };

let client: Resend | null = null;
function resend() {
  client ??= new Resend(env.resendApiKey());
  return client;
}

export async function renderEmail(element: ReactElement) {
  const html = await render(element);
  return { html, text: toPlainText(html) };
}

/**
 * Render a React Email template and deliver it via Resend.
 * Without RESEND_API_KEY the email is logged instead, so local flows keep working.
 */
export async function sendEmail({ to, subject, react, replyTo, tags }: SendEmailInput): Promise<SendEmailResult> {
  const { html, text } = await renderEmail(react);
  if (!isResendConfigured()) {
    if (process.env.NODE_ENV !== "test") console.info(`[email:skipped] to=${String(to)} subject="${subject}"`);
    return { ok: true, id: null, skipped: true };
  }
  const { data, error } = await resend().emails.send({ from: env.emailFrom(), to, subject, html, text, replyTo, tags });
  if (error) {
    console.error("[email:error]", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id ?? null };
}
