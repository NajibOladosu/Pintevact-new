"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { passwordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/utils";

export function PasswordInput({ showStrength, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { showStrength?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const strength = passwordStrength(value);
  const colors = ["bg-line-strong", "bg-danger", "bg-subtle", "bg-fg", "bg-accent"];
  return (
    <div>
      <div className="relative">
        <Input {...props} type={visible ? "text" : "password"} value={value} onChange={(e) => setValue(e.target.value)} className="pr-20" />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 h-9 -translate-y-1/2 rounded-full px-3 text-[0.8125rem] font-semibold text-fg transition-colors hover:bg-fg/5"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {showStrength && value ? (
        <div className="mt-2.5 flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= strength.score ? colors[strength.score] : "bg-line")} />
            ))}
          </div>
          <span className="w-24 text-right text-xs text-muted">{strength.label}</span>
        </div>
      ) : null}
    </div>
  );
}
