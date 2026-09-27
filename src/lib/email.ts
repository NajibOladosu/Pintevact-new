import "server-only";
import type { ReactElement } from "react";
import { render, toPlainText } from "@react-email/render";
import { createTransport, type Transporter } from "nodemailer";
import { Resend } from "resend";
import { env, isResendConfigured } from "@/lib/env";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult = { ok: true; id: string | null } | { ok: false; error: string };

let client: Resend | null = null;
function resend() {
  client ??= new Resend(env.resendApiKey());
  return client;
}

let smtp: Transporter | null = null;
function smtpTransport() {
  smtp ??= createTransport(env.smtpUrl());
  return smtp;
}

export async function renderEmail(element: ReactElement) {
  const html = await render(element);
  return { html, text: toPlainText(html) };
}

/**
 * Render a React Email template and deliver it: through Resend when RESEND_API_KEY is set, otherwise
 * through SMTP_URL (any SMTP server, e.g. Resend's SMTP relay or the local Mailpit inbox used in tests).
 * With neither configured, sending fails.
 */
export async function sendEmail({ to, subject, react, replyTo, tags }: SendEmailInput): Promise<SendEmailResult> {
  const { html, text } = await renderEmail(react);
  if (isResendConfigured()) {
    const { data, error } = await resend().emails.send({ from: env.emailFrom(), to, subject, html, text, replyTo, tags });
    if (error) {
      console.error("[email:error]", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  }
  if (env.smtpUrl()) {
    try {
      const info = await smtpTransport().sendMail({ from: env.emailFrom(), to, subject, html, text, replyTo, headers: tags ? { "X-Pintevact-Tags": tags.map((t) => `${t.name}=${t.value}`).join(",") } : undefined });
      return { ok: true, id: info.messageId ?? null };
    } catch (err) {
      console.error("[email:error]", err);
      return { ok: false, error: err instanceof Error ? err.message : "SMTP delivery failed" };
    }
  }
  console.error(`[email:unconfigured] Set RESEND_API_KEY or SMTP_URL to send "${subject}".`);
  return { ok: false, error: "Email delivery is not configured" };
}
