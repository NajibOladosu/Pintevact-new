import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@/components/icons";
import { findPost, journal } from "@/content/journal";
import { buttonClasses } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journal.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : { title: "Not found" };
}

export default async function JournalPostPage({ params }: Props) {
  const post = findPost((await params).slug);
  if (!post) notFound();
  const others = journal.filter((p) => p.slug !== post.slug).slice(0, 2);
  return (
    <article className="mx-auto max-w-[46rem] px-5 pt-6 sm:px-8 sm:pt-10">
      <Link href="/journal" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium text-muted ring-1 ring-line transition-colors hover:text-fg hover:ring-line-strong">
        <ArrowLeft size={13} /> Journal
      </Link>
      <p className="eyebrow mt-10 text-accent-ink">
        {post.category} · {post.readingMinutes} min read
      </p>
      <h1 className="mt-5 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1] tracking-[-0.05em]">{post.title}</h1>
      <p className="mt-5 text-muted">
        By {post.author}, {formatDate(post.publishedAt)}
      </p>
      <div className="mt-12 border-t border-line pt-10">
        {post.body.map((block, i) => {
          if (block.type === "h2") return <h2 key={i} className="h-sub mt-14">{block.text}</h2>;
          if (block.type === "quote")
            return (
              <blockquote key={i} className="my-12 border-l-2 border-accent pl-6 text-[1.7rem] font-semibold leading-snug tracking-[-0.03em]">
                “{block.text}”
              </blockquote>
            );
          if (block.type === "tip")
            return (
              <aside key={i} className="my-12 rounded-[1.6rem] bg-violet p-7 text-on-violet sm:p-9">
                <p className="eyebrow text-on-violet-muted">Try this</p>
                <p className="mt-4 text-lg leading-relaxed">{block.text}</p>
              </aside>
            );
          return (
            <p key={i} className="mt-5 text-lg leading-[1.75] text-muted">
              {block.text}
            </p>
          );
        })}
      </div>
      <div className="mt-16 rounded-[2rem] bg-frame p-8 text-on-frame shadow-frame sm:p-10">
        <span className="eyebrow text-on-frame-muted">Ready when you are</span>
        <p className="h-sub mt-5">Practise ideas like this, not just read them.</p>
        <p className="mt-3 text-on-frame-muted">Our courses stop the video and ask how an idea shows up in your life.</p>
        <Link href="/courses" className={buttonClasses({ variant: "light", className: "mt-7" })}>
          See courses <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {others.map((p) => (
          <Link key={p.slug} href={`/journal/${p.slug}`} className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line transition-shadow hover:shadow-card">
            <p className="eyebrow text-muted">Read next</p>
            <p className="mt-3 text-lg font-semibold leading-snug tracking-[-0.02em]">{p.title}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
