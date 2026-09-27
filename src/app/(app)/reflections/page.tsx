import type { Metadata } from "next";
import { Vault, type VaultNote, type VaultReflection } from "@/components/app/vault";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";

export const metadata: Metadata = { title: "Reflection Vault" };

export default async function ReflectionsPage() {
  const viewer = await requireViewer();
  const snap = await getLearnerSnapshot(viewer.id);

  const reflections: VaultReflection[] = snap.reflections.flatMap((r) => {
    const ctx = snap.lessonIndex.get(r.lessonId);
    const interaction = ctx?.lesson.interactions.find((i) => i.id === r.interactionId);
    if (!ctx || !interaction || !r.response.text) return [];
    return [
      {
        id: r.interactionId,
        prompt: interaction.prompt,
        text: r.response.text,
        lessonTitle: ctx.lesson.title,
        courseTitle: ctx.course.title,
        href: `/learn/${ctx.course.slug}/${ctx.lesson.slug}?t=${interaction.atSeconds}`,
        createdAt: r.createdAt,
      },
    ];
  });

  const notes: VaultNote[] = snap.notes.flatMap((n) => {
    const ctx = snap.lessonIndex.get(n.lessonId);
    if (!ctx) return [];
    return [{ id: n.id, body: n.body, atSeconds: n.atSeconds, lessonTitle: ctx.lesson.title, courseTitle: ctx.course.title, href: `/learn/${ctx.course.slug}/${ctx.lesson.slug}?t=${n.atSeconds}`, createdAt: n.createdAt }];
  });

  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow text-lucid">Private to you</p>
      <h1 className="mt-2 text-5xl sm:text-6xl">
        The Reflection <span className="display-italic">Vault</span>
      </h1>
      <p className="mt-3 max-w-2xl text-mist">Everything you&apos;ve written while learning — a living journal of what you&apos;re discovering about yourself.</p>
      <div className="mt-10">
        <Vault reflections={reflections} notes={notes} />
      </div>
    </div>
  );
}
