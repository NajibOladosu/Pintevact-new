import { Body, Column, Container, Head, Hr, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

/**
 * The Pintevact email system: the site's warm paper, Outfit type, a papercut art band,
 * one rounded panel, orange pill actions and the giant wordmark footer.
 * Everything is inline-styled and table-based so it holds up in Gmail, Apple Mail and Outlook.
 */
export const brand = {
  paper: "#f9f3e9",
  paper2: "#f1e8da",
  panel: "#fefcf8",
  ink: "#0d0d19",
  ink2: "#3d3b4f",
  ink3: "#595969",
  line: "#e6ddcf",
  ember: "#ee4217",
  emberInk: "#c8340c",
  onEmber: "#faf8f4",
  violet: "#371a6a",
  onViolet: "#f5f1ea",
  onVioletMuted: "#d3cbe3",
  frame: "#0b0a14",
  onFrame: "#f5f1ea",
  onFrameMuted: "#b9b4c4",
  font: "Outfit, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'SFMono-Regular', Menlo, Consolas, monospace",
};

/** Crops of the papercut artwork, served from /public/email as JPEG for every mail client. */
export type Band = "violet" | "amber" | "dawn" | "dusk";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pintevact.com").replace(/\/$/, "");
}

export function absolute(path: string) {
  return path.startsWith("http") ? path : `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

type FooterProps = {
  /** Why this person is receiving the email. */
  reason?: ReactNode;
  /** One-click unsubscribe link for marketing and engagement emails. */
  unsubscribeUrl?: string;
};

export function EmailLayout({ preview, band, children, footerNote, reason, unsubscribeUrl }: { preview: string; band?: Band; children: ReactNode; footerNote?: ReactNode } & FooterProps) {
  const url = siteUrl();
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- email markup, not a Next.js page */}
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          @media only screen and (max-width: 480px) {
            .pv-content { padding: 28px 22px 30px !important; }
            .pv-heading { font-size: 30px !important; line-height: 33px !important; }
            .pv-wordmark { font-size: 48px !important; line-height: 44px !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.paper, margin: 0, padding: "28px 10px 40px", fontFamily: brand.font, color: brand.ink, WebkitFontSmoothing: "antialiased" }}>
        <Container style={{ maxWidth: 600, width: "100%", margin: "0 auto" }}>
          {/* Header: wordmark left, a quiet pill right, the same pairing as the site header. */}
          <Section style={{ padding: "4px 8px 22px" }}>
            <Row>
              <Column>
                <Link href={url} style={{ fontFamily: brand.font, fontWeight: 600, fontSize: 26, letterSpacing: "-0.02em", color: brand.ink, textDecoration: "none" }}>
                  Pintevact
                </Link>
              </Column>
              <Column align="right">
                <Link
                  href={`${url}/dashboard`}
                  style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: brand.ink, textDecoration: "none", backgroundColor: brand.panel, border: `1px solid ${brand.line}`, borderRadius: 999, padding: "9px 16px" }}
                >
                  Open Pintevact →
                </Link>
              </Column>
            </Row>
          </Section>

          <Section style={{ backgroundColor: brand.panel, borderRadius: 28, border: `1px solid ${brand.line}`, overflow: "hidden" }}>
            {band ? (
              <Section style={{ padding: "8px 8px 0" }}>
                <Img src={`${url}/email/band-${band}.jpg`} width="582" height="194" alt="" style={{ display: "block", width: "100%", height: "auto", borderRadius: 22 }} />
              </Section>
            ) : null}
            <Section className="pv-content" style={{ padding: band ? "34px 40px 38px" : "42px 40px 38px" }}>
              {children}
            </Section>
          </Section>

          {footerNote ? (
            <Text style={{ fontSize: 13, lineHeight: "20px", color: brand.ink3, margin: "18px 12px 0", textAlign: "center" }}>{footerNote}</Text>
          ) : null}

          {/* Footer: the wordmark as a sign-off, then the small print. */}
          <Section style={{ padding: "34px 12px 0" }}>
            <Text className="pv-wordmark" style={{ fontFamily: brand.font, fontSize: 64, lineHeight: "56px", fontWeight: 700, letterSpacing: "-0.045em", color: brand.ink, margin: "0 0 18px", textAlign: "center" }}>PINTEVACT</Text>
            <Text style={{ fontSize: 13, lineHeight: "20px", color: brand.ink2, margin: "0 0 10px", textAlign: "center" }}>
              <Link href={`${url}/courses`} style={footerLink}>
                Courses
              </Link>
              {"  ·  "}
              <Link href={`${url}/account`} style={footerLink}>
                Your account
              </Link>
              {"  ·  "}
              <Link href={`${url}/contact`} style={footerLink}>
                Help
              </Link>
            </Text>
            <Text style={{ fontSize: 12, lineHeight: "19px", color: brand.ink3, margin: 0, textAlign: "center" }}>
              {reason ?? "You're receiving this because you have a Pintevact account."}
              {unsubscribeUrl ? (
                <>
                  {" "}
                  <Link href={unsubscribeUrl} style={{ color: brand.ink3, textDecoration: "underline" }}>
                    Unsubscribe
                  </Link>
                  .
                </>
              ) : null}
              <br />
              Pintevact · Learn the psychology of you.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const footerLink: CSSProperties = { color: brand.ink2, textDecoration: "none", fontWeight: 500 };

/** Orange uppercase label above a headline, as on the site. */
export function Eyebrow({ children, color = brand.emberInk }: { children: ReactNode; color?: string }) {
  return <Text style={{ fontSize: 11, lineHeight: "14px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color, margin: "0 0 14px" }}>{children}</Text>;
}

export function Heading({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Text className="pv-heading" style={{ fontFamily: brand.font, fontSize: 36, lineHeight: "38px", fontWeight: 600, letterSpacing: "-0.04em", margin: "0 0 18px", color: brand.ink }}>{children}</Text>
    </>
  );
}

export function P({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={{ fontSize: 16, lineHeight: "26px", margin: "0 0 16px", color: muted ? brand.ink3 : brand.ink2 }}>{children}</Text>;
}

export function Small({ children }: { children: ReactNode }) {
  return <Text style={{ fontSize: 13, lineHeight: "20px", margin: "0 0 12px", color: brand.ink3 }}>{children}</Text>;
}

/** The primary action: an orange pill with an arrow. `ink` gives the near-black block used on cards. */
export function CTA({ href, children, tone = "signal" }: { href: string; children: ReactNode; tone?: "signal" | "ink" }) {
  const signal = tone === "signal";
  return (
    <Section style={{ margin: "26px 0 6px" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: signal ? brand.ember : brand.ink,
          color: signal ? brand.onEmber : brand.panel,
          fontFamily: brand.font,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "20px",
          padding: signal ? "15px 28px" : "15px 24px",
          borderRadius: signal ? 999 : 14,
          textDecoration: "none",
        }}
      >
        {children}&nbsp;&nbsp;→
      </Link>
    </Section>
  );
}

export function FallbackLink({ href }: { href: string }) {
  return (
    <>
      <Hr style={{ borderColor: brand.line, borderTopWidth: 1, margin: "28px 0 16px" }} />
      <Text style={{ fontSize: 12, lineHeight: "18px", color: brand.ink3, margin: 0 }}>
        Button not working? Paste this link into your browser:
        <br />
        <Link href={href} style={{ color: brand.violet, wordBreak: "break-all" }}>
          {href}
        </Link>
      </Text>
    </>
  );
}

/** A deep violet block for the one thing worth remembering. */
export function Callout({ children, eyebrow }: { children: ReactNode; eyebrow?: string; tone?: string }) {
  return (
    <Section style={{ backgroundColor: brand.violet, borderRadius: 22, padding: "22px 26px", margin: "10px 0 20px" }}>
      {eyebrow ? <Eyebrow color={brand.onVioletMuted}>{eyebrow}</Eyebrow> : null}
      <div style={{ color: brand.onViolet }}>{children}</div>
    </Section>
  );
}

export function CalloutText({ children, large }: { children: ReactNode; large?: boolean }) {
  return <Text style={{ margin: 0, fontSize: large ? 20 : 15, lineHeight: large ? "27px" : "23px", fontWeight: large ? 600 : 400, letterSpacing: large ? "-0.02em" : 0, color: brand.onViolet }}>{children}</Text>;
}

/** Numbered steps with orange indices, as in the site's lesson path. */
export function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <Section style={{ margin: "6px 0 8px", borderTop: `1px solid ${brand.line}` }}>
      {items.map((s, i) => (
        <Row key={s.title} style={{ borderBottom: `1px solid ${brand.line}` }}>
          <Column style={{ width: 44, verticalAlign: "top", padding: "16px 0" }}>
            <Text style={{ margin: 0, fontSize: 15, fontWeight: 600, color: brand.emberInk }}>{String(i + 1).padStart(2, "0")}</Text>
          </Column>
          <Column style={{ verticalAlign: "top", padding: "16px 0" }}>
            <Text style={{ margin: 0, fontSize: 16, lineHeight: "22px", fontWeight: 600, color: brand.ink }}>{s.title}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "21px", color: brand.ink3 }}>{s.body}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

/** Near-black tiles for numbers, echoing the site's dark frames. */
export function Stats({ items }: { items: { value: string | number; label: string }[] }) {
  return (
    <Section style={{ backgroundColor: brand.frame, borderRadius: 22, padding: "8px 8px", margin: "6px 0 22px" }}>
      <Row>
        {items.map((s) => (
          <Column key={s.label} style={{ textAlign: "center", padding: "18px 6px" }}>
            <Text style={{ margin: 0, fontSize: 34, lineHeight: "36px", fontWeight: 600, letterSpacing: "-0.04em", color: brand.onFrame }}>{s.value}</Text>
            <Text style={{ margin: "6px 0 0", fontSize: 11, lineHeight: "14px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: brand.onFrameMuted }}>{s.label}</Text>
          </Column>
        ))}
      </Row>
    </Section>
  );
}

/** Label / value rows on paper, for receipts and plan details. */
export function Details({ rows, total }: { rows: [string, string][]; total?: [string, string] }) {
  return (
    <Section style={{ backgroundColor: brand.paper, borderRadius: 18, border: `1px solid ${brand.line}`, padding: "6px 22px", margin: "6px 0 18px" }}>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={{ padding: "11px 0", fontSize: 14, color: brand.ink3, borderBottom: `1px solid ${brand.line}` }}>{label}</td>
              <td style={{ padding: "11px 0", fontSize: 14, fontWeight: 600, color: brand.ink, textAlign: "right", borderBottom: `1px solid ${brand.line}` }}>{value}</td>
            </tr>
          ))}
          {total ? (
            <tr>
              <td style={{ padding: "14px 0 10px", fontSize: 15, color: brand.ink }}>{total[0]}</td>
              <td style={{ padding: "14px 0 10px", fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", color: brand.ink, textAlign: "right" }}>{total[1]}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Section>
  );
}

/** A one-time code, spaced for reading aloud and copying. */
export function OtpCode({ code, label = "Your code" }: { code: string; label?: string }) {
  return (
    <Section style={{ backgroundColor: brand.paper, border: `1px dashed ${brand.line}`, borderRadius: 18, padding: "18px 12px 20px", margin: "8px 0 18px", textAlign: "center" }}>
      <Text style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: brand.ink3 }}>{label}</Text>
      <Text style={{ margin: 0, fontFamily: brand.mono, fontSize: 34, lineHeight: "40px", letterSpacing: 12, fontWeight: 600, color: brand.ink }}>{code}</Text>
    </Section>
  );
}

/** A small security line: what happened, when, and what to do if it wasn't you. */
export function SecurityNote({ children }: { children: ReactNode }) {
  return (
    <Section style={{ borderLeft: `1px solid ${brand.line}`, padding: "2px 0 2px 16px", margin: "20px 0 0" }}>
      <Text style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: brand.ink3 }}>{children}</Text>
    </Section>
  );
}

export function Divider() {
  return <Hr style={{ borderColor: brand.line, borderTopWidth: 1, margin: "26px 0" }} />;
}
