"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type Announcements } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, type ReactNode } from "react";
import { GripVertical } from "@/components/icons";
import { cn } from "@/lib/utils";

/** A vertical list you can reorder by dragging the grip, or with Space and the arrow keys. */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  label,
  children,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  label: (item: T) => string;
  children: (item: T, index: number) => ReactNode;
}) {
  // A stable id keeps the server-rendered accessibility ids in step with the browser.
  const id = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const name = (id: string | number) => {
    const item = items.find((i) => i.id === id);
    return item ? label(item) : "item";
  };
  const position = (id: string | number) => items.findIndex((i) => i.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${name(active.id)}, position ${position(active.id)} of ${items.length}.`,
    onDragOver: ({ active, over }) => (over ? `${name(active.id)} is now at position ${position(over.id)} of ${items.length}.` : undefined),
    onDragEnd: ({ active, over }) => (over ? `${name(active.id)} dropped at position ${position(over.id)} of ${items.length}.` : `${name(active.id)} dropped.`),
    onDragCancel: ({ active }) => `Moving ${name(active.id)} was cancelled.`,
  };
  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to));
  }
  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} accessibility={{ announcements }}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => children(item, i))}
      </SortableContext>
    </DndContext>
  );
}

/** A row inside SortableList. Render the handle it passes you where the grip should go. */
export function SortableRow({ id, label, disabled, className, children }: { id: string; label: string; disabled?: boolean; className?: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${label}`}
      className="flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-subtle hover:bg-fg/5 hover:text-fg active:cursor-grabbing"
    >
      <GripVertical size={18} weight="bold" aria-hidden />
    </button>
  );
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn(className, isDragging && "relative z-10 shadow-card")}>
      {children(handle)}
    </li>
  );
}
