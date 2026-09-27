import { Plus } from "@/components/icons";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 font-medium">
            {item.q}
            <Plus size={16} className="shrink-0 text-subtle transition-transform duration-200 group-open:rotate-45" aria-hidden />
          </summary>
          <p className="max-w-[65ch] pb-6 leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
