import { local } from "./local-services";

type Summary = { ID: string; Subject: string; To: { Address: string }[]; Created: string };
export type Message = { ID: string; Subject: string; HTML: string; Text: string; To: { Address: string }[]; From: { Address: string } };

/** Waits for an email to arrive in the local Mailpit inbox and returns it. */
export async function waitForEmail(to: string, subject?: RegExp, timeoutMs = 15_000): Promise<Message> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${local.mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`);
    if (res.ok) {
      const { messages } = (await res.json()) as { messages: Summary[] };
      const hit = messages.find((m) => !subject || subject.test(m.Subject));
      if (hit) return (await (await fetch(`${local.mailpitUrl}/api/v1/message/${hit.ID}`)).json()) as Message;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`No email to ${to}${subject ? ` matching ${subject}` : ""} within ${timeoutMs}ms`);
}

/** First link in an email body whose URL matches the pattern. */
export function linkIn(message: Message, pattern: RegExp) {
  const hrefs = [...message.HTML.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
  const found = hrefs.find((h) => pattern.test(h)) ?? message.Text.match(new RegExp(`https?://\\S*${pattern.source}\\S*`))?.[0];
  if (!found) throw new Error(`No link matching ${pattern} in "${message.Subject}"`);
  return found;
}
