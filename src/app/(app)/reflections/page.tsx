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
    <div className="mx-auto max-w-5xl">
      <h1 className="h-page">Reflection vault</h1>
      <p className="mt-2 max-w-[60ch] text-muted">Everything you have written while learning. Only you can see it.</p>
      <div className="mt-8">
        <Vault reflections={reflections} notes={notes} />
      </div>
    </div>
  );
}
