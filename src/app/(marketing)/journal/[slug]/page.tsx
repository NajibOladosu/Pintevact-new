import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPost, journal } from "@/content/journal";
import { buttonClasses } from "@/components/ui/button";
import { themeClasses } from "@/lib/course";
import { cn, formatDate } from "@/lib/utils";

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
    <article className="pb-24">
      <header className={cn("border-b-2 border-ink", themeClasses[post.theme].bg)}>
        <div className="mx-auto max-w-3xl px-4 pb-14 pt-12 sm:px-6">
          <Link href="/journal" className="eyebrow hover:underline">
            ← Journal
          </Link>
          <p className="eyebrow mt-8">
            {post.category} · {post.readingMinutes} min read
          </p>
          <h1 className="text-balance mt-4 text-5xl leading-[0.98] sm:text-6xl">{post.title}</h1>
          <p className="mt-6 text-lg">
            By {post.author} · {formatDate(post.publishedAt)}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
        {post.body.map((block, i) => {
          if (block.type === "h2") return <h2 key={i} className="mt-12 text-3xl">{block.text}</h2>;
          if (block.type === "quote")
            return (
              <blockquote key={i} className="my-10 border-l-4 border-ember pl-6 font-display text-3xl italic leading-snug">
                {block.text}
              </blockquote>
            );
          if (block.type === "tip")
            return (
              <aside key={i} className="my-8 rounded-3xl border-2 border-ink bg-lucid p-6">
                <p className="eyebrow">Try this</p>
                <p className="mt-2 text-lg">{block.text}</p>
              </aside>
            );
          return (
            <p key={i} className={cn("mt-5 text-lg leading-[1.8] text-ink-2", i === 0 && "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-ink")}>
              {block.text}
            </p>
          );
        })}
        <div className="mt-16 rounded-[2rem] bg-night p-8 text-paper sm:p-10">
          <p className="font-display text-3xl">Want to go deeper than an article?</p>
          <p className="mt-2 text-mist">Our interactive courses turn ideas like these into practice — with videos that pause to ask about your life.</p>
          <Link href="/courses" className={buttonClasses({ variant: "lucid", className: "mt-6" })}>
            Explore courses
          </Link>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {others.map((p) => (
            <Link key={p.slug} href={`/journal/${p.slug}`} className="rounded-3xl border-2 border-ink p-6 transition hover:shadow-hard">
              <p className="eyebrow text-ink-3">Read next</p>
              <p className="mt-2 font-display text-xl">{p.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
