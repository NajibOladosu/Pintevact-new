import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

export const brand = {
  paper: "#f4efe6",
  paper2: "#ebe4d6",
  ink: "#15122b",
  ink3: "#6c6788",
  ember: "#ff5a36",
  lucid: "#c8f547",
  iris: "#8b7cff",
  night: "#0f0c22",
  display: "Georgia, 'Times New Roman', serif",
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
          <Section style={{ backgroundColor: brand.night, borderRadius: "24px 24px 0 0", padding: "28px 32px" }}>
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        backgroundColor: brand.ember,
                        border: `6px solid ${brand.paper}`,
                        verticalAlign: "middle",
                      }}
                    />
                    <span style={{ fontFamily: brand.display, fontSize: 24, color: brand.paper, marginLeft: 10, verticalAlign: "middle" }}>Pintevact</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: brand.mono, fontSize: 10, letterSpacing: 2, color: brand.lucid, textTransform: "uppercase" }}>Know thyself</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
          <Section style={{ backgroundColor: brand.paper, padding: "36px 32px 28px", borderRadius: "0 0 24px 24px", border: `2px solid ${brand.ink}`, borderTop: "none" }}>
            {children}
          </Section>
          <Section style={{ padding: "24px 12px", textAlign: "center" }}>
            {footerNote ? <Text style={{ fontSize: 12, color: brand.ink3, margin: "0 0 8px" }}>{footerNote}</Text> : null}
            <Text style={{ fontSize: 12, color: brand.ink3, margin: 0 }}>
              Pintevact · Learn the psychology of you ·{" "}
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
      {eyebrow ? (
        <Text style={{ fontFamily: brand.mono, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: brand.ember, margin: "0 0 10px" }}>{eyebrow}</Text>
      ) : null}
      <Text style={{ fontFamily: brand.display, fontSize: 32, lineHeight: "38px", fontStyle: "italic", margin: "0 0 16px", color: brand.ink }}>{children}</Text>
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
          color: brand.ink,
          fontWeight: 700,
          fontSize: 16,
          padding: "14px 28px",
          borderRadius: 999,
          border: `2px solid ${brand.ink}`,
          boxShadow: `4px 4px 0 ${brand.ink}`,
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
      <Hr style={{ borderColor: "#d8cfbd", margin: "24px 0 16px" }} />
      <Text style={{ fontSize: 12, lineHeight: "18px", color: brand.ink3, margin: 0 }}>
        Button not working? Paste this link into your browser:
        <br />
        <Link href={href} style={{ color: brand.iris, wordBreak: "break-all" }}>
          {href}
        </Link>
      </Text>
    </>
  );
}

export function Callout({ children, tone = "lucid" }: { children: ReactNode; tone?: "lucid" | "iris" | "ember" }) {
  const bg = tone === "lucid" ? brand.lucid : tone === "iris" ? "#e4e0ff" : "#ffd9cf";
  return (
    <Section style={{ backgroundColor: bg, borderRadius: 16, padding: "16px 20px", margin: "8px 0 20px", border: `2px solid ${brand.ink}` }}>
      {children}
    </Section>
  );
}

export function OtpCode({ code }: { code: string }) {
  return (
    <Text
      style={{
        fontFamily: brand.mono,
        fontSize: 32,
        letterSpacing: 10,
        textAlign: "center",
        backgroundColor: "#ffffff",
        border: `2px dashed ${brand.ink}`,
        borderRadius: 16,
        padding: "16px 0",
        margin: "8px 0 20px",
      }}
    >
      {code}
    </Text>
  );
}
