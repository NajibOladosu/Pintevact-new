import { NextResponse, type NextRequest } from "next/server";
import { applyUnsubscribe } from "@/lib/unsubscribe";

/**
 * RFC 8058 one-click unsubscribe. Mail clients (Gmail, Apple Mail, Yahoo) POST here from the
 * List-Unsubscribe header without opening the email.
 */
export async function POST(request: NextRequest) {
  const done = await applyUnsubscribe(request.nextUrl.searchParams.get("t")).catch((err) => {
    console.error("[unsubscribe]", err);
    return "error" as const;
  });
  if (done === "error") return new Response("Could not unsubscribe", { status: 500 });
  if (!done) return new Response("Invalid link", { status: 400 });
  return new Response(null, { status: 204 });
}

/** A plain GET (someone pasting the header link) goes to the confirmation page instead of acting. */
export async function GET(request: NextRequest) {
  const url = new URL("/unsubscribe", request.url);
  const t = request.nextUrl.searchParams.get("t");
  if (t) url.searchParams.set("t", t);
  return NextResponse.redirect(url);
}
