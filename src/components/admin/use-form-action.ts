"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { FormState } from "@/lib/validation";

/**
 * useActionState for editor forms, submitted from onSubmit so React doesn't reset the fields
 * after the action (a failed save keeps what the admin typed).
 */
export function useFormAction(action: (state: FormState, data: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, {});
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(data));
  }
  return { state, onSubmit, pending };
}
