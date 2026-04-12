"use client";

import { useMemo, useRef, useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: string;
  className?: string;
}

// Characters in each digit column strip (order matters for translateY)
const DIGIT_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const SPECIAL_CHARS = [".", "-", "e", "+", "\u2212", "\u221E", "N", "a", " "];

interface CharSlot {
  char: string;
  key: string;
  isDigit: boolean;
}

/**
 * AnimatedNumber — odometer-style digit rolling animation.
 *
 * Each digit sits in a column with overflow:hidden. When the value changes,
 * digits roll to their new position via CSS translateY with staggered delays
 * for a left-to-right cascade effect.
 */
export function AnimatedNumber({ value, className = "" }: AnimatedNumberProps) {
  const prevSlots = useRef<CharSlot[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const slots = useMemo(() => {
    const chars = value.split("");
    const newSlots: CharSlot[] = chars.map((char, i) => ({
      char,
      // Stable key: reuse position-based keys, shift when length changes
      key: `pos-${i}`,
      isDigit: DIGIT_CHARS.includes(char),
    }));
    prevSlots.current = newSlots;
    return newSlots;
  }, [value]);

  if (reducedMotion) {
    return (
      <span className={`font-mono tabular-nums ${className}`}>{value}</span>
    );
  }

  return (
    <span
      className={`inline-flex items-baseline font-mono tabular-nums ${className}`}
      aria-label={value}
      role="text"
    >
      {slots.map((slot, index) => (
        <DigitColumn
          key={slot.key}
          char={slot.char}
          isDigit={slot.isDigit}
          delay={index * 30}
        />
      ))}
    </span>
  );
}

// ─── Individual Digit Column ─────────────────────────────────────────────

interface DigitColumnProps {
  char: string;
  isDigit: boolean;
  delay: number;
}

function DigitColumn({ char, isDigit, delay }: DigitColumnProps) {
  if (!isDigit) {
    return (
      <span
        className="inline-block transition-opacity duration-200"
        style={{ transitionDelay: `${delay}ms` }}
      >
        {char}
      </span>
    );
  }

  const digitIndex = DIGIT_CHARS.indexOf(char);

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height: "1.2em", lineHeight: "1.2em" }}
      aria-hidden="true"
    >
      <span
        className="inline-flex flex-col"
        style={{
          transform: `translateY(${-digitIndex * 1.2}em)`,
          transition: `transform 400ms cubic-bezier(0.23, 1, 0.32, 1)`,
          transitionDelay: `${delay}ms`,
          willChange: "transform",
        }}
      >
        {DIGIT_CHARS.map((d) => (
          <span
            key={d}
            className="inline-block text-center"
            style={{ height: "1.2em", lineHeight: "1.2em" }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}
