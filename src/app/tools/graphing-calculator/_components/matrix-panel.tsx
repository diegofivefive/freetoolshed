"use client";

import { useState, useMemo, useCallback } from "react";
import { Grid3X3, ArrowRightLeft } from "lucide-react";
import type { NamedMatrix, Matrix } from "@/lib/graphing-calculator/types";
import {
  matrixAdd,
  matrixSubtract,
  matrixMultiply,
  scalarMultiply,
  transpose,
  determinant,
  inverse,
  rref,
  identity,
} from "@/lib/graphing-calculator/matrix";
import { MATRIX_NAMES, MAX_MATRIX_SIZE } from "@/lib/graphing-calculator/constants";

interface MatrixPanelProps {
  matrices: NamedMatrix[];
  activeMatrix: string;
  onSetMatrix: (name: string, matrix: NamedMatrix) => void;
  onSetActiveMatrix: (name: string) => void;
}

type MatrixOp =
  | "transpose"
  | "determinant"
  | "inverse"
  | "rref"
  | "add"
  | "subtract"
  | "multiply"
  | "scalar";

export function MatrixPanel({
  matrices,
  activeMatrix,
  onSetMatrix,
  onSetActiveMatrix,
}: MatrixPanelProps) {
  const [secondMatrix, setSecondMatrix] = useState("[B]");
  const [scalarValue, setScalarValue] = useState("2");
  const [resultMatrix, setResultMatrix] = useState<Matrix | null>(null);
  const [resultScalar, setResultScalar] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = useMemo(
    () => matrices.find((m) => m.name === activeMatrix),
    [matrices, activeMatrix]
  );

  const handleDimensionChange = useCallback(
    (dim: "rows" | "cols", value: number) => {
      if (!current || value < 1 || value > MAX_MATRIX_SIZE) return;
      const newRows = dim === "rows" ? value : current.rows;
      const newCols = dim === "cols" ? value : current.cols;

      // Resize data: preserve existing values, fill new cells with 0
      const newData: Matrix = Array.from({ length: newRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) =>
          r < current.rows && c < current.cols ? current.data[r][c] : 0
        )
      );

      onSetMatrix(activeMatrix, {
        ...current,
        rows: newRows,
        cols: newCols,
        data: newData,
      });
    },
    [current, activeMatrix, onSetMatrix]
  );

  const handleCellChange = useCallback(
    (row: number, col: number, value: string) => {
      if (!current) return;
      const num = parseFloat(value);
      if (isNaN(num)) return;
      const newData = current.data.map((r) => [...r]);
      newData[row][col] = num;
      onSetMatrix(activeMatrix, { ...current, data: newData });
    },
    [current, activeMatrix, onSetMatrix]
  );

  const handleFillIdentity = useCallback(() => {
    if (!current) return;
    const n = Math.min(current.rows, current.cols);
    const data = identity(n);
    onSetMatrix(activeMatrix, { ...current, rows: n, cols: n, data });
  }, [current, activeMatrix, onSetMatrix]);

  const handleFillZero = useCallback(() => {
    if (!current) return;
    const data = Array.from({ length: current.rows }, () =>
      new Array(current.cols).fill(0)
    );
    onSetMatrix(activeMatrix, { ...current, data });
  }, [current, activeMatrix, onSetMatrix]);

  const executeOp = useCallback(
    (op: MatrixOp) => {
      if (!current) return;
      setError(null);
      setResultMatrix(null);
      setResultScalar(null);

      try {
        switch (op) {
          case "transpose":
            setResultMatrix(transpose(current.data));
            break;
          case "determinant": {
            if (current.rows !== current.cols) {
              setError("Matrix must be square for determinant");
              return;
            }
            const det = determinant(current.data);
            setResultScalar(det);
            break;
          }
          case "inverse": {
            if (current.rows !== current.cols) {
              setError("Matrix must be square for inverse");
              return;
            }
            setResultMatrix(inverse(current.data));
            break;
          }
          case "rref":
            setResultMatrix(rref(current.data));
            break;
          case "scalar": {
            const s = parseFloat(scalarValue);
            if (isNaN(s)) {
              setError("Invalid scalar value");
              return;
            }
            setResultMatrix(scalarMultiply(current.data, s));
            break;
          }
          case "add":
          case "subtract":
          case "multiply": {
            const other = matrices.find((m) => m.name === secondMatrix);
            if (!other) {
              setError(`Matrix ${secondMatrix} not found`);
              return;
            }
            if (op === "add") setResultMatrix(matrixAdd(current.data, other.data));
            else if (op === "subtract")
              setResultMatrix(matrixSubtract(current.data, other.data));
            else setResultMatrix(matrixMultiply(current.data, other.data));
            break;
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Operation failed");
      }
    },
    [current, matrices, secondMatrix, scalarValue]
  );

  if (!current) return null;

  return (
    <div className="space-y-4">
      {/* ── Matrix Selector + Dimensions ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Matrix:
          </label>
          <select
            value={activeMatrix}
            onChange={(e) => onSetActiveMatrix(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {MATRIX_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Rows:
          </label>
          <input
            type="number"
            min={1}
            max={MAX_MATRIX_SIZE}
            value={current.rows}
            onChange={(e) =>
              handleDimensionChange("rows", parseInt(e.target.value) || 1)
            }
            className="h-8 w-14 rounded-md border border-border bg-background px-2 text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Cols:
          </label>
          <input
            type="number"
            min={1}
            max={MAX_MATRIX_SIZE}
            value={current.cols}
            onChange={(e) =>
              handleDimensionChange("cols", parseInt(e.target.value) || 1)
            }
            className="h-8 w-14 rounded-md border border-border bg-background px-2 text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <button
          onClick={handleFillIdentity}
          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Identity
        </button>
        <button
          onClick={handleFillZero}
          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Zero
        </button>
      </div>

      {/* ── Matrix Grid ──────────────────────────────────────────────── */}
      <div className="overflow-auto rounded-md border border-border">
        <table className="text-sm">
          <tbody>
            {current.data.map((row, r) => (
              <tr key={r} className="border-b border-border/50 last:border-b-0">
                {row.map((cell, c) => (
                  <td key={`${r}-${c}-${cell}`} className="border-r border-border/50 p-0 last:border-r-0">
                    <input
                      type="number"
                      defaultValue={cell}
                      onBlur={(e) => handleCellChange(r, c, e.target.value)}
                      className="h-9 w-20 bg-transparent px-2 text-center font-mono text-sm focus:bg-brand/5 focus:outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Operations ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Operations
        </h4>

        {/* Unary operations */}
        <div className="flex flex-wrap items-center gap-2">
          <OpButton label="Transpose" onClick={() => executeOp("transpose")} />
          <OpButton label="det" onClick={() => executeOp("determinant")} />
          <OpButton label="Inverse" onClick={() => executeOp("inverse")} />
          <OpButton label="RREF" onClick={() => executeOp("rref")} />
        </div>

        {/* Binary operations */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{activeMatrix}</span>
          <select
            value={secondMatrix}
            onChange={(e) => setSecondMatrix(e.target.value)}
            className="h-7 rounded-md border border-border bg-background px-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {MATRIX_NAMES.filter((n) => n !== activeMatrix).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <OpButton label="A+B" onClick={() => executeOp("add")} />
          <OpButton label="A−B" onClick={() => executeOp("subtract")} />
          <OpButton label="A×B" onClick={() => executeOp("multiply")} />
        </div>

        {/* Scalar multiply */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={scalarValue}
            onChange={(e) => setScalarValue(e.target.value)}
            className="h-7 w-16 rounded-md border border-border bg-background px-2 text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <span className="text-xs text-muted-foreground">×</span>
          <OpButton
            label={`Scalar × ${activeMatrix}`}
            onClick={() => executeOp("scalar")}
          />
        </div>
      </div>

      {/* ── Result ────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-md border border-pink-500/30 bg-pink-500/5 px-4 py-2 text-sm text-pink-400">
          {error}
        </div>
      )}

      {resultScalar !== null && (
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-brand" />
            <span className="text-sm font-medium">Result:</span>
            <span className="font-mono text-lg font-bold">{fmtNum(resultScalar)}</span>
          </div>
        </div>
      )}

      {resultMatrix && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-brand" />
              <span className="text-sm font-medium">Result</span>
              <span className="text-xs text-muted-foreground">
                ({resultMatrix.length}×{resultMatrix[0]?.length ?? 0})
              </span>
            </div>
            <button
              onClick={() => {
                if (!resultMatrix || !current) return;
                onSetMatrix(activeMatrix, {
                  ...current,
                  rows: resultMatrix.length,
                  cols: resultMatrix[0]?.length ?? 0,
                  data: resultMatrix,
                });
                setResultMatrix(null);
              }}
              className="rounded-md border border-brand px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
            >
              Store → {activeMatrix}
            </button>
          </div>
          <div className="overflow-auto rounded-md border border-border bg-muted/30">
            <table className="text-sm">
              <tbody>
                {resultMatrix.map((row, r) => (
                  <tr
                    key={r}
                    className="border-b border-border/50 last:border-b-0"
                  >
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className="border-r border-border/50 px-3 py-1.5 text-center font-mono last:border-r-0"
                      >
                        {fmtNum(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function OpButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {label}
    </button>
  );
}

function fmtNum(n: number): string {
  if (Math.abs(n) < 1e-12) return "0";
  if (Number.isInteger(n) && Math.abs(n) < 1e10) return n.toString();
  const abs = Math.abs(n);
  if (abs >= 1e6 || (abs > 0 && abs < 0.0001)) return n.toExponential(4);
  return parseFloat(n.toPrecision(8)).toString();
}
