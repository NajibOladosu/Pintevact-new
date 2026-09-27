import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StationLine } from "@/components/brand/station-line";
import { PrintButton } from "@/components/app/print-button";
import { buttonClasses } from "@/components/ui/button";
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
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-4 py-10 print:p-0">
      <div className="relative flex aspect-[1.414/1] w-full max-w-5xl flex-col justify-between rounded-[1.6rem] bg-violet p-6 text-on-violet sm:p-14 print:rounded-none">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
            <span className="wordmark text-sm sm:text-base">Pintevact</span>
          </span>
          <span className="text-xs text-on-violet-muted sm:text-sm">Certificate of completion</span>
        </div>
        <div>
          <p className="text-sm text-on-violet-muted sm:text-lg">This certifies that</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight sm:mt-2 sm:text-6xl">{cert.learnerName}</p>
          <p className="mt-2 text-sm text-on-violet-muted sm:mt-5 sm:text-lg">completed every lesson and checkpoint of</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.035em] sm:mt-2 sm:text-4xl">{cert.courseTitle}</p>
        </div>
        <div>
          <StationLine
            className="[--bg:var(--violet)] [--line-strong:rgb(248_242_234/0.25)]"
            stations={Array.from({ length: 6 }, (_, i) => ({ id: String(i), state: "done" as const }))}
            size="sm"
          />
          <div className="tabular mt-4 flex justify-between text-[0.65rem] text-on-violet-muted sm:text-xs">
            <span>Issued {formatDate(cert.certificate.issuedAt, { dateStyle: "long" })}</span>
            <span>ID {cert.certificate.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
      <div className="mt-8 flex gap-3 print:hidden">
        <PrintButton />
        <Link href={`/courses/${cert.courseSlug}`} className={buttonClasses({ variant: "outline" })}>
          About this course
        </Link>
      </div>
    </main>
  );
}
