import { Award, BookOpenCheck, Brain, Compass, Flame, InfinityIcon, NotebookPen, PenLine, Sparkles, Star, Trophy, type IconType } from "@/components/icons";

const icons: Record<string, IconType> = {
  "first-light": Star,
  "inner-voice": PenLine,
  "sharp-mind": Brain,
  kindled: Flame,
  unbroken: InfinityIcon,
  "deep-diver": NotebookPen,
  cartographer: Compass,
  polymath: BookOpenCheck,
  scribe: PenLine,
  integrated: Trophy,
  luminary: Sparkles,
};

export function badgeIcon(id: string): IconType {
  return icons[id] ?? Award;
}
