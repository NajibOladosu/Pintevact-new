import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { Constellation } from "@/components/brand/constellation";
import { PrintButton } from "@/components/app/print-button";
import { getStore } from "@/lib/data";
import { UUID_RE } from "@/lib/ids";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  if (!UUID_RE.test(id)) return null;
  return getStore().getCertificate(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cert = await load((await params).id);
  return cert ? { title: `${cert.learnerName} completed ${cert.courseTitle}` } : { title: "Certificate" };
}

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;
  const cert = await load(id);
  if (!cert) notFound();
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center bg-paper-2 px-4 py-10 print:bg-white print:p-0">
      <div className="relative aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-[2rem] border-2 border-ink bg-night text-paper shadow-hard-lg print:rounded-none print:shadow-none">
        <Constellation className="absolute inset-0 h-full w-full text-mist" count={60} seed={id.charCodeAt(0) + id.charCodeAt(1)} lineOpacity={0.18} />
        <div className="absolute inset-3 rounded-[1.6rem] border border-lucid/30 sm:inset-5" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center sm:px-16">
          <LogoMark className="h-10 w-10 sm:h-14 sm:w-14" />
          <p className="eyebrow mt-4 text-lucid sm:mt-6">Certificate of Integration</p>
          <p className="mt-3 text-sm text-mist sm:mt-6 sm:text-lg">This certifies that</p>
          <p className="mt-1 font-display text-3xl italic sm:mt-2 sm:text-7xl">{cert.learnerName}</p>
          <p className="mt-2 text-sm text-mist sm:mt-4 sm:text-lg">has completed every lesson, checkpoint and reflection of</p>
          <p className="mt-1 font-display text-2xl text-ember sm:mt-2 sm:text-5xl">{cert.courseTitle}</p>
          <div className="mt-4 flex items-center gap-6 font-mono text-[0.6rem] uppercase tracking-widest text-mist sm:mt-10 sm:gap-12 sm:text-xs">
            <span>Issued {formatDate(cert.certificate.issuedAt, { dateStyle: "long" })}</span>
            <span className="hidden sm:inline">ID {cert.certificate.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
      <div className="mt-8 flex gap-4 print:hidden">
        <PrintButton />
        <Link href={`/courses/${cert.courseSlug}`} className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold hover:bg-ink hover:text-paper">
          About this course
        </Link>
      </div>
    </main>
  );
}
