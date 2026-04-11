"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";

/**
 * Tracks the last focused <input> or <textarea> within a container element.
 * Provides methods to programmatically insert text, backspace, and clear
 * the active input — compatible with React controlled components.
 *
 * Uses the native value setter + synthetic input event to bypass React's
 * internal value cache, ensuring onChange handlers fire correctly.
 */
export function useActiveInput(containerRef: RefObject<HTMLElement | null>) {
  const activeRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleFocusIn(e: FocusEvent) {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        activeRef.current = target;
      }
    }

    container.addEventListener("focusin", handleFocusIn, true);
    return () => container.removeEventListener("focusin", handleFocusIn, true);
  }, [containerRef]);

  /**
   * Set value on a controlled React input using the native setter,
   * then dispatch a synthetic input event so React picks up the change.
   */
  const setNativeValue = useCallback(
    (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
      const proto =
        el instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (nativeSetter) {
        nativeSetter.call(el, value);
      } else {
        // Fallback — won't trigger React onChange but better than nothing
        el.value = value;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    },
    []
  );

  /** Insert text at the cursor position in the active input. */
  const insert = useCallback(
    (text: string) => {
      const el = activeRef.current;
      if (!el) return;
      el.focus();

      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? start;
      const newValue =
        el.value.slice(0, start) + text + el.value.slice(end);

      setNativeValue(el, newValue);
      const cursorPos = start + text.length;
      el.setSelectionRange(cursorPos, cursorPos);
    },
    [setNativeValue]
  );

  /** Delete one character before the cursor (backspace). */
  const backspace = useCallback(() => {
    const el = activeRef.current;
    if (!el) return;
    el.focus();

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;

    if (start !== end) {
      // Delete selection
      const newValue = el.value.slice(0, start) + el.value.slice(end);
      setNativeValue(el, newValue);
      el.setSelectionRange(start, start);
    } else if (start > 0) {
      // Delete one char before cursor
      const newValue = el.value.slice(0, start - 1) + el.value.slice(start);
      setNativeValue(el, newValue);
      el.setSelectionRange(start - 1, start - 1);
    }
  }, [setNativeValue]);

  /** Clear the entire active input value. */
  const clearInput = useCallback(() => {
    const el = activeRef.current;
    if (!el) return;
    el.focus();
    setNativeValue(el, "");
    el.setSelectionRange(0, 0);
  }, [setNativeValue]);

  /** Navigate to the next or previous input within the container. */
  const navigateInputs = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      const container = containerRef.current;
      if (!container) return;

      const inputs = Array.from(
        container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          "input, textarea"
        )
      );
      if (inputs.length === 0) return;

      const currentIndex = activeRef.current
        ? inputs.indexOf(activeRef.current)
        : -1;

      let nextIndex: number;
      if (direction === "down" || direction === "right") {
        nextIndex =
          currentIndex < inputs.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : inputs.length - 1;
      }

      const nextEl = inputs[nextIndex];
      if (nextEl) {
        nextEl.focus();
        activeRef.current = nextEl;
      }
    },
    [containerRef]
  );

  return { insert, backspace, clearInput, navigateInputs, activeRef };
}
