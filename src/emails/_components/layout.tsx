import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

export const brand = {
  paper: "#f8f2ea",
  paper2: "#efe7db",
  ink: "#11101c",
  ink3: "#5f5a6b",
  line: "#e2d9cc",
  ember: "#ee4216",
  violet: "#361a6a",
  onViolet: "#f8f2ea",
  onVioletMuted: "#cbbfe0",
  wordmark: "Outfit, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  display: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  body: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.paper2, margin: 0, padding: "32px 12px", fontFamily: brand.body, color: brand.ink }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>
          <Section style={{ padding: "8px 8px 20px" }}>
            <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 999, backgroundColor: brand.ember, verticalAlign: "middle" }} />
            <span style={{ fontFamily: brand.wordmark, fontWeight: 600, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: brand.ink, marginLeft: 8, verticalAlign: "middle" }}>Pintevact</span>
          </Section>
          <Section style={{ backgroundColor: "#fffbf6", padding: "36px 32px 28px", borderRadius: 16, border: `1px solid ${brand.line}` }}>
            {children}
          </Section>
          <Section style={{ padding: "24px 12px", textAlign: "center" }}>
            {footerNote ? <Text style={{ fontSize: 12, color: brand.ink3, margin: "0 0 8px" }}>{footerNote}</Text> : null}
            <Text style={{ fontSize: 12, color: brand.ink3, margin: 0 }}>
              Pintevact, psychology you answer.{" "}
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

export function Heading({ children }: { children: ReactNode; eyebrow?: string }) {
  return <Text style={{ fontFamily: brand.display, fontSize: 26, lineHeight: "32px", fontWeight: 600, letterSpacing: "-0.01em", margin: "0 0 16px", color: brand.ink }}>{children}</Text>;
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
          color: brand.ink,
          fontWeight: 600,
          fontSize: 15,
          padding: "13px 22px",
          borderRadius: 10,
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
  return <Section style={{ backgroundColor: brand.violet, color: brand.onViolet, borderRadius: 12, padding: "16px 20px", margin: "8px 0 20px" }}>{children}</Section>;
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
        borderRadius: 10,
        padding: "16px 0",
        margin: "8px 0 20px",
      }}
    >
      {code}
    </Text>
  );
}
