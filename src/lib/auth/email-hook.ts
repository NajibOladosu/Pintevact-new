import { createElement, type ReactElement } from "react";
import ConfirmSignupEmail from "@/emails/confirm-signup";
import MagicLinkEmail from "@/emails/magic-link";
import ResetPasswordEmail from "@/emails/reset-password";
import EmailChangeEmail from "@/emails/email-change";
import InviteEmail from "@/emails/invite";
import ReauthenticationEmail from "@/emails/reauthentication";

/** Payload Supabase posts to the "Send Email" auth hook. */
export type AuthHookPayload = {
  user: { email: string; new_email?: string; email_new?: string; user_metadata?: { full_name?: string; name?: string } };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: "signup" | "magiclink" | "recovery" | "email_change" | "invite" | "reauthentication" | "email" | string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
};

export type AuthEmail = { to: string; subject: string; react: ReactElement };

export function confirmUrl(siteUrl: string, tokenHash: string, type: string, redirectTo?: string, fallbackNext = "/dashboard") {
  const url = new URL("/auth/confirm", siteUrl);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", type);
  let next = fallbackNext;
  if (redirectTo) {
    try {
      const r = new URL(redirectTo, siteUrl);
      if (r.origin === new URL(siteUrl).origin) next = r.pathname + r.search;
    } catch {
      /* keep fallback */
    }
  }
  url.searchParams.set("next", next);
  return url.toString();
}

/** Map a Supabase auth hook payload to the branded emails that should be sent. */
export function buildAuthEmails(payload: AuthHookPayload, siteUrl: string): AuthEmail[] {
  const { user, email_data: d } = payload;
  const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
  switch (d.email_action_type) {
    case "signup":
      return [{ to: user.email, subject: "Confirm your email · Pintevact", react: createElement(ConfirmSignupEmail, { name, confirmUrl: confirmUrl(siteUrl, d.token_hash, "email", d.redirect_to, "/dashboard?welcome=1"), token: d.token }) }];
    case "magiclink":
      return [{ to: user.email, subject: "Your sign-in link · Pintevact", react: createElement(MagicLinkEmail, { loginUrl: confirmUrl(siteUrl, d.token_hash, "magiclink", d.redirect_to), token: d.token }) }];
    case "recovery":
      return [{ to: user.email, subject: "Reset your password · Pintevact", react: createElement(ResetPasswordEmail, { name, resetUrl: confirmUrl(siteUrl, d.token_hash, "recovery", undefined, "/reset-password") }) }];
    case "invite":
      return [{ to: user.email, subject: "You're invited to Pintevact", react: createElement(InviteEmail, { inviteUrl: confirmUrl(siteUrl, d.token_hash, "invite", d.redirect_to, "/reset-password") }) }];
    case "reauthentication":
      return [{ to: user.email, subject: "Your verification code · Pintevact", react: createElement(ReauthenticationEmail, { token: d.token }) }];
    case "email_change": {
      const newEmail = user.new_email ?? user.email_new ?? "";
      const emails: AuthEmail[] = [];
      // Supabase quirk: token_hash belongs to the NEW address, token_hash_new to the CURRENT one.
      if (newEmail && d.token_hash) {
        emails.push({ to: newEmail, subject: "Confirm your new email · Pintevact", react: createElement(EmailChangeEmail, { newEmail, confirmUrl: confirmUrl(siteUrl, d.token_hash, "email_change", undefined, "/account?email=updated") }) });
      }
      if (d.token_hash_new) {
        emails.push({ to: user.email, subject: "Approve your email change · Pintevact", react: createElement(EmailChangeEmail, { newEmail, isCurrentAddress: true, confirmUrl: confirmUrl(siteUrl, d.token_hash_new, "email_change", undefined, "/account?email=updated") }) });
      }
      return emails;
    }
    default:
      return [];
  }
}
