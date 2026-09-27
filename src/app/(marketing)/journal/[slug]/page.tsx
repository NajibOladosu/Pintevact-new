import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/icons";
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
    <article className="mx-auto max-w-[44rem] px-5 pb-24 pt-10 sm:px-8 md:pt-14">
      <Link href="/journal" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} /> Journal
      </Link>
      <p className="mt-10 text-sm text-subtle">
        {post.category}, {post.readingMinutes} min read
      </p>
      <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">{post.title}</h1>
      <p className="mt-5 text-muted">
        By {post.author}, {formatDate(post.publishedAt)}
      </p>
      <div className="mt-12 border-t border-line pt-10">
        {post.body.map((block, i) => {
          if (block.type === "h2") return <h2 key={i} className="mt-12 text-2xl font-semibold tracking-tight">{block.text}</h2>;
          if (block.type === "quote")
            return (
              <blockquote key={i} className="my-10 text-2xl font-semibold leading-snug tracking-tight">
                “{block.text}”
              </blockquote>
            );
          if (block.type === "tip")
            return (
              <aside key={i} className="my-10 rounded-2xl bg-violet p-6 text-on-violet">
                <p className="text-sm font-medium">Try this</p>
                <p className="mt-2 text-lg leading-relaxed text-on-violet-muted">{block.text}</p>
              </aside>
            );
          return (
            <p key={i} className="mt-5 text-lg leading-[1.75] text-muted">
              {block.text}
            </p>
          );
        })}
      </div>
      <div className="mt-16 rounded-2xl border border-line bg-raised p-7">
        <p className="text-lg font-semibold">Practise ideas like this, not just read them.</p>
        <p className="mt-1 text-muted">Our courses stop the video and ask how an idea shows up in your life.</p>
        <Link href="/courses" className={buttonClasses({ variant: "secondary", className: "mt-5" })}>
          See courses
        </Link>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {others.map((p) => (
          <Link key={p.slug} href={`/journal/${p.slug}`} className="rounded-2xl border border-line p-5 transition-colors hover:border-line-strong">
            <p className="text-sm text-subtle">Read next</p>
            <p className="mt-2 font-semibold leading-snug">{p.title}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
