"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

/** Warns before leaving the page while a form has edits that weren't saved. */
export function useUnsavedChanges(form: RefObject<HTMLFormElement | null>) {
  const dirty = useRef(false);
  useEffect(() => {
    const el = form.current;
    if (!el) return;
    const mark = () => (dirty.current = true);
    const clean = () => (dirty.current = false);
    const warn = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      e.preventDefault();
    };
    el.addEventListener("input", mark);
    el.addEventListener("reset", clean);
    window.addEventListener("beforeunload", warn);
    return () => {
      el.removeEventListener("input", mark);
      el.removeEventListener("reset", clean);
      window.removeEventListener("beforeunload", warn);
    };
  }, [form]);
  const markClean = useCallback(() => (dirty.current = false), []);
  return { markClean };
}
