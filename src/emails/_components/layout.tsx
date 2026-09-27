import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

export const brand = {
  paper: "#f9f3e9",
  paper2: "#f1e8da",
  panel: "#fefcf8",
  ink: "#0d0d19",
  ink3: "#595969",
  line: "#e6ddcf",
  ember: "#ee4217",
  onEmber: "#faf8f4",
  violet: "#371a6a",
  onViolet: "#f5f1ea",
  onVioletMuted: "#d3cbe3",
  wordmark: "Outfit, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  display: "Outfit, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  body: "Outfit, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'SFMono-Regular', Menlo, Consolas, monospace",
};

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pintevact.com").replace(/\/$/, "");
}

export function EmailLayout({ preview, children, footerNote }: { preview: string; children: ReactNode; footerNote?: ReactNode }) {
  const url = siteUrl();
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- email markup, not a Next.js page */}
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.paper2, margin: 0, padding: "32px 12px", fontFamily: brand.body, color: brand.ink }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>
          <Section style={{ padding: "8px 8px 20px" }}>
            <span style={{ fontFamily: brand.wordmark, fontWeight: 600, fontSize: 24, letterSpacing: "-0.02em", color: brand.ink }}>Pintevact</span>
          </Section>
          <Section style={{ backgroundColor: brand.panel, padding: "40px 36px 32px", borderRadius: 28, border: `1px solid ${brand.line}` }}>
            {children}
          </Section>
          <Section style={{ padding: "24px 12px", textAlign: "center" }}>
            {footerNote ? <Text style={{ fontSize: 12, color: brand.ink3, margin: "0 0 8px" }}>{footerNote}</Text> : null}
            <Text style={{ fontFamily: brand.wordmark, fontSize: 44, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.04em", color: brand.ink, margin: "8px 0 16px" }}>PINTEVACT</Text>
            <Text style={{ fontSize: 12, color: brand.ink3, margin: 0 }}>
              Pintevact. Learn the psychology of you.{" "}
              <Link href={`${url}/account`} style={{ color: brand.ink3, textDecoration: "underline" }}>
                Email preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Heading({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <>
      {eyebrow ? <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c8340c", margin: "0 0 12px" }}>{eyebrow}</Text> : null}
      <Text style={{ fontFamily: brand.display, fontSize: 32, lineHeight: "34px", fontWeight: 600, letterSpacing: "-0.04em", margin: "0 0 16px", color: brand.ink }}>{children}</Text>
    </>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <Text style={{ fontSize: 16, lineHeight: "26px", margin: "0 0 16px", color: brand.ink }}>{children}</Text>;
}

export function CTA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ margin: "24px 0 8px" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: brand.ember,
          color: brand.onEmber,
          fontWeight: 600,
          fontSize: 15,
          padding: "15px 26px",
          borderRadius: 999,
          textDecoration: "none",
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

export function FallbackLink({ href }: { href: string }) {
  return (
    <>
      <Hr style={{ borderColor: brand.line, margin: "24px 0 16px" }} />
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

export function Callout({ children }: { children: ReactNode; tone?: string }) {
  return <Section style={{ backgroundColor: brand.violet, color: brand.onViolet, borderRadius: 22, padding: "20px 24px", margin: "8px 0 20px" }}>{children}</Section>;
}

export function OtpCode({ code }: { code: string }) {
  return (
    <Text
      style={{
        fontFamily: brand.mono,
        fontSize: 30,
        letterSpacing: 10,
        textAlign: "center",
        backgroundColor: brand.paper,
        border: `1px solid ${brand.line}`,
        borderRadius: 14,
        padding: "16px 0",
        margin: "8px 0 20px",
      }}
    >
      {code}
    </Text>
  );
}
