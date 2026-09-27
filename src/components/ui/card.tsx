import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[1.5rem] border border-line bg-raised p-6 sm:p-8", className)} {...props} />;
}
