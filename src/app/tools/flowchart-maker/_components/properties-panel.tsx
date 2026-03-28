"use client";

import type { Dispatch } from "react";
import type {
  EditorState,
  FlowchartAction,
  RouteType,
  ArrowHead,
} from "@/lib/flowchart/types";
import {
  SHAPE_PRESETS,
  GRID_SIZE_OPTIONS,
  FILL_COLOR_PRESETS,
  STROKE_COLOR_PRESETS,
  DASH_PRESETS,
  ARROW_HEAD_OPTIONS,
} from "@/lib/flowchart/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface PropertiesPanelProps {
  state: EditorState;
  dispatch: Dispatch<FlowchartAction>;
}

const ROUTE_TYPE_OPTIONS: { label: string; value: RouteType }[] = [
  { label: "Bezier", value: "bezier" },
  { label: "Straight", value: "straight" },
  { label: "Orthogonal", value: "orthogonal" },
];

export function PropertiesPanel({ state, dispatch }: PropertiesPanelProps) {
  const { diagram } = state;

  const selectedNodes = diagram.nodes.filter((n) =>
    state.selectedNodeIds.includes(n.id)
  );

  const selectedEdges = diagram.edges.filter((e) =>
    state.selectedEdgeIds.includes(e.id)
  );

  // ── No selection — show diagram settings ──────────────────
  if (selectedNodes.length === 0 && selectedEdges.length === 0) {
    return (
      <div className="hidden w-56 overflow-y-auto border-l border-border bg-card p-3 lg:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Diagram Settings
        </h3>

        <div className="mt-3 space-y-3">
          <div>
            <Label className="text-xs">Grid Size</Label>
            <select
              value={diagram.gridSize}
              onChange={(e) =>
                dispatch({
                  type: "SET_GRID",
                  payload: { gridSize: Number(e.target.value) },
                })
              }
              className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              {GRID_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={diagram.gridVisible}
              onChange={(e) =>
                dispatch({
                  type: "SET_GRID",
                  payload: { gridVisible: e.target.checked },
                })
              }
              className="rounded"
            />
            Show Grid
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={diagram.gridSnap}
              onChange={(e) =>
                dispatch({
                  type: "SET_GRID",
                  payload: { gridSnap: e.target.checked },
                })
              }
              className="rounded"
            />
            Snap to Grid
          </label>

          <Separator />

          {/* Default route type */}
          <div>
            <Label className="text-xs">Default Edge Type</Label>
            <select
              value={state.defaultRouteType}
              onChange={(e) =>
                dispatch({
                  type: "SET_DEFAULT_ROUTE_TYPE",
                  payload: e.target.value as RouteType,
                })
              }
              className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              {ROUTE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">
            {diagram.nodes.length} node{diagram.nodes.length !== 1 ? "s" : ""}
            {diagram.edges.length > 0 &&
              ` · ${diagram.edges.length} edge${diagram.edges.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
    );
  }

  // ── Edge(s) selected ──────────────────────────────────────
  if (selectedEdges.length > 0) {
    const isSingle = selectedEdges.length === 1;
    const edge = selectedEdges[0];

    return (
      <div className="hidden w-56 overflow-y-auto border-l border-border bg-card p-3 lg:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isSingle ? "Connection" : `${selectedEdges.length} Connections`}
        </h3>

        {isSingle && (
          <div className="mt-3 space-y-3">
            {/* Label */}
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={edge.label}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EDGE",
                    payload: { id: edge.id, label: e.target.value },
                  })
                }
                className="mt-1 h-7 text-sm"
                placeholder="Edge label…"
              />
            </div>

            {/* Route type */}
            <div>
              <Label className="text-xs">Route Type</Label>
              <select
                value={edge.routeType}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EDGE",
                    payload: {
                      id: edge.id,
                      routeType: e.target.value as RouteType,
                      controlPoints: [], // reset custom control points
                    },
                  })
                }
                className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                {ROUTE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Separator />

            {/* Stroke color */}
            <div>
              <Label className="text-xs">Stroke</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {STROKE_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_EDGE",
                        payload: {
                          id: edge.id,
                          style: { ...edge.style, stroke: color },
                        },
                      })
                    }
                    className={`h-5 w-5 rounded border ${
                      edge.style.stroke === color
                        ? "border-brand ring-1 ring-brand/40"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Stroke width */}
            <div>
              <Label className="text-xs">
                Stroke Width ({edge.style.strokeWidth}px)
              </Label>
              <input
                type="range"
                min={1}
                max={6}
                step={0.5}
                value={edge.style.strokeWidth}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EDGE",
                    payload: {
                      id: edge.id,
                      style: {
                        ...edge.style,
                        strokeWidth: Number(e.target.value),
                      },
                    },
                  })
                }
                className="mt-1 w-full"
              />
            </div>

            {/* Dash pattern */}
            <div>
              <Label className="text-xs">Line Style</Label>
              <select
                value={edge.style.dashArray}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EDGE",
                    payload: {
                      id: edge.id,
                      style: { ...edge.style, dashArray: e.target.value },
                    },
                  })
                }
                className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                {DASH_PRESETS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <Separator />

            {/* Arrow head */}
            <div>
              <Label className="text-xs">Arrow Head</Label>
              <select
                value={edge.style.arrowHead}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EDGE",
                    payload: {
                      id: edge.id,
                      style: {
                        ...edge.style,
                        arrowHead: e.target.value as ArrowHead,
                      },
                    },
                  })
                }
                className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                {ARROW_HEAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Arrow tail */}
            <div>
              <Label className="text-xs">Arrow Tail</Label>
              <select
                value={edge.style.arrowTail}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EDGE",
                    payload: {
                      id: edge.id,
                      style: {
                        ...edge.style,
                        arrowTail: e.target.value as ArrowHead,
                      },
                    },
                  })
                }
                className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                {ARROW_HEAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Separator />
          </div>
        )}

        <div className={isSingle ? "space-y-2" : "mt-3 space-y-2"}>
          <button
            onClick={() =>
              dispatch({
                type: "REMOVE_EDGES",
                payload: selectedEdges.map((e) => e.id),
              })
            }
            className="w-full rounded-md bg-pink-500/10 px-3 py-1.5 text-sm font-medium text-pink-500 hover:bg-pink-500/20"
          >
            {isSingle ? "Delete Connection" : "Delete All Selected"}
          </button>
        </div>
      </div>
    );
  }

  // ── Single node selected ──────────────────────────────────
  if (selectedNodes.length === 1) {
    const node = selectedNodes[0];
    return (
      <div className="hidden w-56 overflow-y-auto border-l border-border bg-card p-3 lg:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {SHAPE_PRESETS.find((s) => s.type === node.shape)?.label ?? "Shape"}
        </h3>

        <div className="mt-3 space-y-3">
          {/* Text */}
          <div>
            <Label className="text-xs">Text</Label>
            <Input
              value={node.text}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_NODE",
                  payload: { id: node.id, text: e.target.value },
                })
              }
              className="mt-1 h-7 text-sm"
            />
          </div>

          {/* Shape type */}
          <div>
            <Label className="text-xs">Shape</Label>
            <select
              value={node.shape}
              onChange={(e) => {
                const preset = SHAPE_PRESETS.find(
                  (s) => s.type === e.target.value
                );
                if (preset) {
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: {
                      id: node.id,
                      shape: preset.type,
                    },
                  });
                }
              }}
              className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              {SHAPE_PRESETS.map((preset) => (
                <option key={preset.type} value={preset.type}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round(node.x)}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: { id: node.id, x: Number(e.target.value) },
                  })
                }
                className="mt-1 h-7 text-sm"
                step={diagram.gridSnap ? diagram.gridSize : 1}
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round(node.y)}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: { id: node.id, y: Number(e.target.value) },
                  })
                }
                className="mt-1 h-7 text-sm"
                step={diagram.gridSnap ? diagram.gridSize : 1}
              />
            </div>
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">W</Label>
              <Input
                type="number"
                value={Math.round(node.width)}
                onChange={(e) =>
                  dispatch({
                    type: "RESIZE_NODE",
                    payload: {
                      id: node.id,
                      width: Math.max(20, Number(e.target.value)),
                      height: node.height,
                    },
                  })
                }
                className="mt-1 h-7 text-sm"
                min={20}
              />
            </div>
            <div>
              <Label className="text-xs">H</Label>
              <Input
                type="number"
                value={Math.round(node.height)}
                onChange={(e) =>
                  dispatch({
                    type: "RESIZE_NODE",
                    payload: {
                      id: node.id,
                      width: node.width,
                      height: Math.max(20, Number(e.target.value)),
                    },
                  })
                }
                className="mt-1 h-7 text-sm"
                min={20}
              />
            </div>
          </div>

          <Separator />

          {/* Fill color */}
          <div>
            <Label className="text-xs">Fill</Label>
            <div className="mt-1 flex flex-wrap gap-1">
              {FILL_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_NODE",
                      payload: {
                        id: node.id,
                        style: { ...node.style, fill: color },
                      },
                    })
                  }
                  className={`h-5 w-5 rounded border ${
                    node.style.fill === color
                      ? "border-brand ring-1 ring-brand/40"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={node.style.fill === "transparent" ? "#ffffff" : node.style.fill}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: {
                      id: node.id,
                      style: { ...node.style, fill: e.target.value },
                    },
                  })
                }
                className="h-7 w-8 cursor-pointer rounded border border-border"
              />
              <Input
                value={node.style.fill}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: {
                      id: node.id,
                      style: { ...node.style, fill: e.target.value },
                    },
                  })
                }
                className="h-7 flex-1 text-sm"
              />
            </div>
          </div>

          {/* Stroke color */}
          <div>
            <Label className="text-xs">Stroke</Label>
            <div className="mt-1 flex flex-wrap gap-1">
              {STROKE_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_NODE",
                      payload: {
                        id: node.id,
                        style: { ...node.style, stroke: color },
                      },
                    })
                  }
                  className={`h-5 w-5 rounded border ${
                    node.style.stroke === color
                      ? "border-brand ring-1 ring-brand/40"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Stroke width */}
          <div>
            <Label className="text-xs">
              Stroke Width ({node.style.strokeWidth}px)
            </Label>
            <input
              type="range"
              min={0}
              max={6}
              step={0.5}
              value={node.style.strokeWidth}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_NODE",
                  payload: {
                    id: node.id,
                    style: {
                      ...node.style,
                      strokeWidth: Number(e.target.value),
                    },
                  },
                })
              }
              className="mt-1 w-full"
            />
          </div>

          <Separator />

          {/* Font */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Font Size</Label>
              <Input
                type="number"
                value={node.style.fontSize}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: {
                      id: node.id,
                      style: {
                        ...node.style,
                        fontSize: Number(e.target.value) || 12,
                      },
                    },
                  })
                }
                className="mt-1 h-7 text-sm"
                min={8}
                max={48}
              />
            </div>
            <div>
              <Label className="text-xs">Weight</Label>
              <select
                value={node.style.fontWeight}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: {
                      id: node.id,
                      style: {
                        ...node.style,
                        fontWeight: e.target.value as "normal" | "bold",
                      },
                    },
                  })
                }
                className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>

          {/* Text color */}
          <div>
            <Label className="text-xs">Text Color</Label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={node.style.textColor}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: {
                      id: node.id,
                      style: { ...node.style, textColor: e.target.value },
                    },
                  })
                }
                className="h-7 w-8 cursor-pointer rounded border border-border"
              />
              <Input
                value={node.style.textColor}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_NODE",
                    payload: {
                      id: node.id,
                      style: { ...node.style, textColor: e.target.value },
                    },
                  })
                }
                className="h-7 flex-1 text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* Z-ordering */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                dispatch({ type: "BRING_TO_FRONT", payload: node.id })
              }
              className="flex-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
            >
              Bring Front
            </button>
            <button
              onClick={() =>
                dispatch({ type: "SEND_TO_BACK", payload: node.id })
              }
              className="flex-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
            >
              Send Back
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={node.locked}
              onChange={(e) =>
                dispatch({
                  type: e.target.checked ? "LOCK_NODES" : "UNLOCK_NODES",
                  payload: [node.id],
                })
              }
              className="rounded"
            />
            Lock Shape
          </label>

          <button
            onClick={() =>
              dispatch({ type: "REMOVE_NODES", payload: [node.id] })
            }
            className="w-full rounded-md bg-pink-500/10 px-3 py-1.5 text-sm font-medium text-pink-500 hover:bg-pink-500/20"
          >
            Delete Shape
          </button>
        </div>
      </div>
    );
  }

  // ── Multi-selection ───────────────────────────────────────
  return (
    <div className="hidden w-56 overflow-y-auto border-l border-border bg-card p-3 lg:block">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {selectedNodes.length} Selected
      </h3>

      <div className="mt-3 space-y-2">
        <button
          onClick={() =>
            dispatch({
              type: "REMOVE_NODES",
              payload: selectedNodes.map((n) => n.id),
            })
          }
          className="w-full rounded-md bg-pink-500/10 px-3 py-1.5 text-sm font-medium text-pink-500 hover:bg-pink-500/20"
        >
          Delete All Selected
        </button>
      </div>
    </div>
  );
}
