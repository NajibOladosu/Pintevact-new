"use client";

import { Printer } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClasses({ variant: "secondary" })}>
      <Printer size={16} /> Print or save as PDF
    </button>
  );
}
