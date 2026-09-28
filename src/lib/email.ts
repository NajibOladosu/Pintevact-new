import "server-only";
import type { ReactElement } from "react";
import { render, toPlainText } from "@react-email/render";
import { createTransport, type Transporter } from "nodemailer";
import { Resend } from "resend";
import { env, isResendConfigured } from "@/lib/env";

export type EmailTag = { name: string; value: string };

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
  tags?: EmailTag[];
  /** Extra headers, e.g. List-Unsubscribe for newsletters and reminders. */
  headers?: Record<string, string>;
  /**
   * Resend deduplicates sends with the same key for 24 hours, so a retried webhook or job
   * never emails twice. Use a stable key per logical message (e.g. `receipt/<checkout id>`).
   */
  idempotencyKey?: string;
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

/** Resend tag values allow only letters, numbers, underscores and dashes. */
function cleanTags(tags?: EmailTag[]) {
  return tags?.map((t) => ({ name: t.name.replace(/[^\w-]/g, "_"), value: t.value.replace(/[^\w-]/g, "_") }));
}

function smtpHeaders(input: Pick<SendEmailInput, "headers" | "tags" | "idempotencyKey">) {
  const headers: Record<string, string> = { ...input.headers };
  if (input.tags?.length) headers["X-Pintevact-Tags"] = input.tags.map((t) => `${t.name}=${t.value}`).join(",");
  if (input.idempotencyKey) headers["X-Pintevact-Idempotency-Key"] = input.idempotencyKey;
  return headers;
}

/**
 * Render a React Email template and deliver it through Resend (RESEND_API_KEY). Without a Resend key,
 * SMTP_URL is used instead (Resend's SMTP relay, or the local Mailpit inbox in tests). With neither,
 * sending fails loudly rather than pretending.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { to, subject, react, replyTo, tags, headers, idempotencyKey } = input;
  const { html, text } = await renderEmail(react);
  if (isResendConfigured()) {
    const { data, error } = await resend().emails.send(
      { from: env.emailFrom(), to, subject, html, text, replyTo, tags: cleanTags(tags), headers },
      idempotencyKey ? { idempotencyKey } : undefined,
    );
    if (error) {
      console.error("[email:error]", subject, error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  }
  if (env.smtpUrl()) {
    try {
      const info = await smtpTransport().sendMail({ from: env.emailFrom(), to, subject, html, text, replyTo, headers: smtpHeaders(input) });
      return { ok: true, id: info.messageId ?? null };
    } catch (err) {
      console.error("[email:error]", subject, err);
      return { ok: false, error: err instanceof Error ? err.message : "SMTP delivery failed" };
    }
  }
  console.error(`[email:unconfigured] Set RESEND_API_KEY or SMTP_URL to send "${subject}".`);
  return { ok: false, error: "Email delivery is not configured" };
}

export type BatchResult = { sent: number; failed: number; errors: string[] };

/** Resend accepts at most 100 messages per batch request. */
export const BATCH_SIZE = 100;

/**
 * Send many individual emails (each with its own recipient, links and headers), 100 per Resend batch
 * request. Each chunk gets its own idempotency key, so re-running a partly failed send skips chunks
 * that already went out.
 */
export async function sendBatch(messages: SendEmailInput[], opts: { idempotencyKey?: string } = {}): Promise<BatchResult> {
  const result: BatchResult = { sent: 0, failed: 0, errors: [] };
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE);
    const chunkKey = opts.idempotencyKey ? `${opts.idempotencyKey}/${i / BATCH_SIZE}` : undefined;
    if (isResendConfigured()) {
      const payload = await Promise.all(
        chunk.map(async (m) => {
          const { html, text } = await renderEmail(m.react);
          return { from: env.emailFrom(), to: m.to, subject: m.subject, html, text, replyTo: m.replyTo, tags: cleanTags(m.tags), headers: m.headers };
        }),
      );
      const { error } = await resend().batch.send(payload, chunkKey ? { idempotencyKey: chunkKey } : undefined);
      if (error) {
        console.error("[email:batch-error]", error);
        result.failed += chunk.length;
        result.errors.push(error.message);
      } else {
        result.sent += chunk.length;
      }
      continue;
    }
    for (const m of chunk) {
      const res = await sendEmail({ ...m, idempotencyKey: m.idempotencyKey ?? (chunkKey ? `${chunkKey}/${String(m.to)}` : undefined) });
      if (res.ok) result.sent++;
      else {
        result.failed++;
        result.errors.push(res.error);
      }
    }
  }
  return result;
}
