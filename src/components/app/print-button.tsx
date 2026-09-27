"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-lucid px-5 py-2.5 font-semibold shadow-hard">
      <Printer size={16} /> Print / Save PDF
    </button>
  );
}
