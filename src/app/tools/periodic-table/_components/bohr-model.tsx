"use client";

import { memo } from "react";

interface BohrModelProps {
  symbol: string;
  atomicNumber: number;
  electronShells: number[];
}

/**
 * SVG Bohr model — concentric rings with orbiting electrons.
 * Each shell is a circle with evenly-spaced electron dots.
 * Electrons animate with CSS rotation at different speeds per shell.
 */
function BohrModelInner({
  symbol,
  atomicNumber,
  electronShells,
}: BohrModelProps) {
  const shellCount = electronShells.length;
  const viewSize = 200;
  const center = viewSize / 2;
  // Scale shell radii to fit — innermost at 28, outermost near edge
  const minRadius = 26;
  const maxRadius = center - 14;
  const radiusStep =
    shellCount > 1 ? (maxRadius - minRadius) / (shellCount - 1) : 0;

  return (
    <div className="relative mx-auto my-3 aspect-square w-full max-w-[200px]">
      <svg
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        className="h-full w-full"
        aria-label={`Bohr model of ${symbol} with ${atomicNumber} electrons in ${shellCount} shells`}
      >
        {/* Background glow */}
        <defs>
          <radialGradient id={`nucleus-glow-${atomicNumber}`}>
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={22}
          fill={`url(#nucleus-glow-${atomicNumber})`}
        />

        {/* Nucleus */}
        <circle
          cx={center}
          cy={center}
          r={14}
          fill="var(--color-brand)"
          opacity={0.9}
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[11px] font-black"
          fill="white"
        >
          {symbol}
        </text>

        {/* Electron shells */}
        {electronShells.map((electronCount, shellIndex) => {
          const radius = minRadius + shellIndex * radiusStep;
          // Animation duration — outer shells rotate slower
          const duration = 6 + shellIndex * 4;
          // Alternate rotation direction
          const direction = shellIndex % 2 === 0 ? 1 : -1;

          return (
            <g key={shellIndex}>
              {/* Shell orbit ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={0.8}
                strokeDasharray="3 3"
                opacity={0.5}
              />

              {/* Rotating electron group */}
              <g
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  animation: `bohrSpin${direction > 0 ? "" : "Reverse"} ${duration}s linear infinite`,
                }}
              >
                {Array.from({ length: electronCount }, (_, eIdx) => {
                  const angle = (2 * Math.PI * eIdx) / electronCount;
                  const ex = center + radius * Math.cos(angle);
                  const ey = center + radius * Math.sin(angle);
                  // Electron size — slightly smaller on outer shells if crowded
                  const dotR = electronCount > 12 ? 2.5 : 3.2;

                  return (
                    <g key={eIdx}>
                      {/* Electron glow */}
                      <circle
                        cx={ex}
                        cy={ey}
                        r={dotR + 2}
                        fill="var(--color-brand)"
                        opacity={0.15}
                      />
                      {/* Electron dot */}
                      <circle
                        cx={ex}
                        cy={ey}
                        r={dotR}
                        fill="var(--color-brand)"
                        opacity={0.9}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Shell label (electron count) — positioned at top of ring */}
              <text
                x={center}
                y={center - radius - 5}
                textAnchor="middle"
                className="text-[7px] font-semibold"
                fill="var(--color-muted-foreground)"
                opacity={0.7}
              >
                {electronCount}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export const BohrModel = memo(BohrModelInner);
