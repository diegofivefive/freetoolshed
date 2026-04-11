"use client";

import { useMemo, useCallback } from "react";
import type {
  GraphFunction,
  AngleMode,
  TableSettings,
} from "@/lib/graphing-calculator/types";
import { evaluateAtX } from "@/lib/graphing-calculator/engine";

interface TableViewProps {
  functions: GraphFunction[];
  angleMode: AngleMode;
  tableSettings: TableSettings;
  onTableSettingsChange: (settings: Partial<TableSettings>) => void;
}

const TABLE_ROW_COUNT = 30;

export function TableView({
  functions,
  angleMode,
  tableSettings,
  onTableSettingsChange,
}: TableViewProps) {
  const visibleFunctions = useMemo(
    () => functions.filter((fn) => fn.visible && fn.expression.trim()),
    [functions]
  );

  // Generate x values
  const xValues = useMemo(() => {
    const values: number[] = [];
    for (let i = 0; i < TABLE_ROW_COUNT; i++) {
      values.push(tableSettings.tblStart + i * tableSettings.deltaTbl);
    }
    return values;
  }, [tableSettings.tblStart, tableSettings.deltaTbl]);

  // Compute y values for each function at each x
  const tableData = useMemo(() => {
    return xValues.map((x) => {
      const row: { x: number; ys: (number | null)[] } = { x, ys: [] };
      for (const fn of visibleFunctions) {
        const y = evaluateAtX(fn.expression, x, angleMode);
        row.ys.push(isFinite(y) ? y : null);
      }
      return row;
    });
  }, [xValues, visibleFunctions, angleMode]);

  const handleTblStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) onTableSettingsChange({ tblStart: val });
    },
    [onTableSettingsChange]
  );

  const handleDeltaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val !== 0) onTableSettingsChange({ deltaTbl: val });
    },
    [onTableSettingsChange]
  );

  return (
    <div className="space-y-4">
      {/* ── Table Setup ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            TblStart
          </label>
          <input
            type="number"
            value={tableSettings.tblStart}
            onChange={handleTblStartChange}
            className="h-7 w-20 rounded-md border border-border bg-background px-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            ΔTbl
          </label>
          <input
            type="number"
            value={tableSettings.deltaTbl}
            onChange={handleDeltaChange}
            step="0.1"
            className="h-7 w-20 rounded-md border border-border bg-background px-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {visibleFunctions.length === 0
            ? "Add a function in Graph mode to see values"
            : `${visibleFunctions.length} function${visibleFunctions.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {visibleFunctions.length > 0 ? (
        <div className="max-h-[460px] overflow-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="border-b border-r border-border px-3 py-2 text-left font-mono font-semibold">
                  X
                </th>
                {visibleFunctions.map((fn) => (
                  <th
                    key={fn.id}
                    className="border-b border-r border-border px-3 py-2 text-left font-mono font-semibold last:border-r-0"
                  >
                    <span
                      className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: fn.color }}
                    />
                    {fn.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-b-0 hover:bg-muted/50"
                >
                  <td className="border-r border-border px-3 py-1.5 font-mono text-muted-foreground">
                    {formatTableValue(row.x)}
                  </td>
                  {row.ys.map((y, j) => (
                    <td
                      key={j}
                      className="border-r border-border px-3 py-1.5 font-mono last:border-r-0"
                    >
                      {y !== null ? (
                        formatTableValue(y)
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex min-h-[300px] items-center justify-center rounded-md border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Switch to Graph mode and enter at least one function to see its table values.
          </p>
        </div>
      )}
    </div>
  );
}

function formatTableValue(value: number): string {
  if (Number.isInteger(value) && Math.abs(value) < 1e10) {
    return value.toString();
  }
  const abs = Math.abs(value);
  if (abs >= 1e6 || (abs > 0 && abs < 0.0001)) {
    return value.toExponential(4);
  }
  return parseFloat(value.toPrecision(8)).toString();
}
