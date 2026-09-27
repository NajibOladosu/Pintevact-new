"use client";

import { useState } from "react";
import { Eye, EyeOff } from "@/components/icons";
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
        <Input
          {...props}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-subtle hover:bg-fg/5 hover:text-fg"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showStrength && value ? (
        <div className="mt-2 flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={cn("h-0.5 flex-1 transition-colors", i <= strength.score ? colors[strength.score] : "bg-line-strong")} />
            ))}
          </div>
          <span className="w-24 text-right text-xs text-subtle">{strength.label}</span>
        </div>
      ) : null}
    </div>
  );
}
