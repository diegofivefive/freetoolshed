"use client";

import { useRef, type Dispatch } from "react";
import type {
  EditorState,
  FloorPlanAction,
  FloorPlanElement,
  RoomElement,
  TextElement,
  WallElement,
} from "@/lib/floor-plan/types";
import { ROOM_PRESETS } from "@/lib/floor-plan/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface PropertiesPanelProps {
  state: EditorState;
  selectedElements: FloorPlanElement[];
  dispatch: Dispatch<FloorPlanAction>;
}

export function PropertiesPanel({
  state,
  selectedElements,
  dispatch,
}: PropertiesPanelProps) {
  const { plan } = state;

  // No selection — show plan settings
  if (selectedElements.length === 0) {
    return (
      <div className="w-64 overflow-y-auto border-l border-border bg-card p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Plan Settings
        </h3>

        <div className="mt-3 space-y-3">
          <div>
            <Label className="text-xs">Width ({plan.unit})</Label>
            <Input
              type="number"
              value={plan.width}
              onChange={(e) =>
                dispatch({
                  type: "SET_PLAN_SIZE",
                  payload: { width: Number(e.target.value) || 1, height: plan.height },
                })
              }
              className="mt-1 h-7 text-sm"
              min={1}
            />
          </div>
          <div>
            <Label className="text-xs">Height ({plan.unit})</Label>
            <Input
              type="number"
              value={plan.height}
              onChange={(e) =>
                dispatch({
                  type: "SET_PLAN_SIZE",
                  payload: { width: plan.width, height: Number(e.target.value) || 1 },
                })
              }
              className="mt-1 h-7 text-sm"
              min={1}
            />
          </div>

          <Separator />

          <div>
            <Label className="text-xs">Unit</Label>
            <select
              value={plan.unit}
              onChange={(e) =>
                dispatch({ type: "SET_UNIT", payload: e.target.value as "ft" | "m" })
              }
              className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="ft">Feet</option>
              <option value="m">Meters</option>
            </select>
          </div>

          <div>
            <Label className="text-xs">Grid Size ({plan.unit})</Label>
            <select
              value={plan.gridSize}
              onChange={(e) =>
                dispatch({ type: "SET_GRID", payload: { gridSize: Number(e.target.value) } })
              }
              className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value={0.5}>0.5</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={5}>5</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={plan.showGrid}
              onChange={(e) =>
                dispatch({ type: "SET_GRID", payload: { showGrid: e.target.checked } })
              }
              className="rounded"
            />
            Show Grid
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={plan.gridSnap}
              onChange={(e) =>
                dispatch({ type: "SET_GRID", payload: { gridSnap: e.target.checked } })
              }
              className="rounded"
            />
            Snap to Grid
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={plan.showDimensions}
              onChange={() => dispatch({ type: "TOGGLE_DIMENSIONS" })}
              className="rounded"
            />
            Show Dimensions
          </label>
        </div>

        <Separator className="my-3" />

        <UnderlayControls state={state} dispatch={dispatch} />

        <Separator className="my-3" />

        <p className="text-xs text-muted-foreground">
          {plan.elements.length} element{plan.elements.length !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  // Single element selected
  if (selectedElements.length === 1) {
    const el = selectedElements[0];
    return (
      <div className="w-64 overflow-y-auto border-l border-border bg-card p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {el.type === "room" ? "Room" : el.type === "furniture" ? "Furniture" : el.type === "wall" ? "Wall" : "Text"}
        </h3>

        <div className="mt-3 space-y-3">
          <div>
            <Label className="text-xs">Label</Label>
            <Input
              value={el.label}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_ELEMENT",
                  payload: { id: el.id, label: e.target.value },
                })
              }
              className="mt-1 h-7 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X ({plan.unit})</Label>
              <Input
                type="number"
                value={Math.round(el.x * 100) / 100}
                onChange={(e) =>
                  dispatch({
                    type: "MOVE_ELEMENT",
                    payload: { id: el.id, x: Number(e.target.value), y: el.y },
                  })
                }
                className="mt-1 h-7 text-sm"
                step={plan.gridSnap ? plan.gridSize : 0.1}
              />
            </div>
            <div>
              <Label className="text-xs">Y ({plan.unit})</Label>
              <Input
                type="number"
                value={Math.round(el.y * 100) / 100}
                onChange={(e) =>
                  dispatch({
                    type: "MOVE_ELEMENT",
                    payload: { id: el.id, x: el.x, y: Number(e.target.value) },
                  })
                }
                className="mt-1 h-7 text-sm"
                step={plan.gridSnap ? plan.gridSize : 0.1}
              />
            </div>
          </div>

          {"width" in el && "height" in el && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">W ({plan.unit})</Label>
                <Input
                  type="number"
                  value={Math.round((el as { width: number }).width * 100) / 100}
                  onChange={(e) =>
                    dispatch({
                      type: "RESIZE_ELEMENT",
                      payload: {
                        id: el.id,
                        width: Number(e.target.value) || 1,
                        height: (el as { height: number }).height,
                      },
                    })
                  }
                  className="mt-1 h-7 text-sm"
                  min={0.5}
                  step={plan.gridSnap ? plan.gridSize : 0.1}
                />
              </div>
              <div>
                <Label className="text-xs">H ({plan.unit})</Label>
                <Input
                  type="number"
                  value={Math.round((el as { height: number }).height * 100) / 100}
                  onChange={(e) =>
                    dispatch({
                      type: "RESIZE_ELEMENT",
                      payload: {
                        id: el.id,
                        width: (el as { width: number }).width,
                        height: Number(e.target.value) || 1,
                      },
                    })
                  }
                  className="mt-1 h-7 text-sm"
                  min={0.5}
                  step={plan.gridSnap ? plan.gridSize : 0.1}
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs">Rotation</Label>
            <Input
              type="number"
              value={el.rotation}
              onChange={(e) =>
                dispatch({
                  type: "ROTATE_ELEMENT",
                  payload: { id: el.id, rotation: Number(e.target.value) % 360 },
                })
              }
              className="mt-1 h-7 text-sm"
              step={15}
            />
          </div>

          {/* Room-specific fields */}
          {el.type === "room" && (
            <>
              <Separator />
              <div>
                <Label className="text-xs">Room Type</Label>
                <select
                  value={(el as RoomElement).roomType}
                  onChange={(e) => {
                    const preset = ROOM_PRESETS.find((p) => p.type === e.target.value);
                    if (preset) {
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: {
                          id: el.id,
                          roomType: preset.type,
                          label: preset.label,
                          fill: preset.fill,
                        },
                      });
                    }
                  }}
                  className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
                >
                  {ROOM_PRESETS.map((preset) => (
                    <option key={preset.type} value={preset.type}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Fill Color</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={(el as RoomElement).fill}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: { id: el.id, fill: e.target.value },
                      })
                    }
                    className="h-7 w-10 cursor-pointer rounded border border-border"
                  />
                  <Input
                    value={(el as RoomElement).fill}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: { id: el.id, fill: e.target.value },
                      })
                    }
                    className="h-7 flex-1 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Text-specific fields */}
          {el.type === "text" && (
            <>
              <Separator />
              <div>
                <Label className="text-xs">Text Content</Label>
                <Input
                  value={(el as TextElement).text}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_ELEMENT",
                      payload: { id: el.id, text: e.target.value },
                    })
                  }
                  className="mt-1 h-7 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    value={(el as TextElement).fontSize}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: { id: el.id, fontSize: Number(e.target.value) || 12 },
                      })
                    }
                    className="mt-1 h-7 text-sm"
                    min={8}
                    max={72}
                  />
                </div>
                <div>
                  <Label className="text-xs">Weight</Label>
                  <select
                    value={(el as TextElement).fontWeight}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: { id: el.id, fontWeight: e.target.value as "normal" | "bold" },
                      })
                    }
                    className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Text Color</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={(el as TextElement).color}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: { id: el.id, color: e.target.value },
                      })
                    }
                    className="h-7 w-10 cursor-pointer rounded border border-border"
                  />
                  <Input
                    value={(el as TextElement).color}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: { id: el.id, color: e.target.value },
                      })
                    }
                    className="h-7 flex-1 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Wall-specific fields */}
          {el.type === "wall" && (
            <>
              <Separator />
              <div>
                <Label className="text-xs">Thickness ({plan.unit})</Label>
                <Input
                  type="number"
                  value={(el as WallElement).thickness}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_ELEMENT",
                      payload: { id: el.id, thickness: Number(e.target.value) || 0.5 },
                    })
                  }
                  className="mt-1 h-7 text-sm"
                  min={0.1}
                  step={0.1}
                />
              </div>
              <div>
                <Label className="text-xs">Wall Color</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={(el as WallElement).strokeColor}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: { id: el.id, strokeColor: e.target.value },
                      })
                    }
                    className="h-7 w-10 cursor-pointer rounded border border-border"
                  />
                  <Input
                    value={(el as WallElement).strokeColor}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ELEMENT",
                        payload: { id: el.id, strokeColor: e.target.value },
                      })
                    }
                    className="h-7 flex-1 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            <button
              onClick={() =>
                dispatch({ type: "BRING_TO_FRONT", payload: el.id })
              }
              className="flex-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
            >
              Bring Front
            </button>
            <button
              onClick={() =>
                dispatch({ type: "SEND_TO_BACK", payload: el.id })
              }
              className="flex-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
            >
              Send Back
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={el.locked}
              onChange={(e) =>
                dispatch({
                  type: e.target.checked ? "LOCK_ELEMENTS" : "UNLOCK_ELEMENTS",
                  payload: [el.id],
                })
              }
              className="rounded"
            />
            Lock Element
          </label>

          <button
            onClick={() =>
              dispatch({ type: "REMOVE_ELEMENTS", payload: [el.id] })
            }
            className="w-full rounded-md bg-pink-500/10 px-3 py-1.5 text-sm font-medium text-pink-500 hover:bg-pink-500/20"
          >
            Delete Element
          </button>
        </div>
      </div>
    );
  }

  // Multi-selection
  return (
    <div className="w-64 overflow-y-auto border-l border-border bg-card p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {selectedElements.length} Selected
      </h3>

      <div className="mt-3">
        <button
          onClick={() =>
            dispatch({
              type: "REMOVE_ELEMENTS",
              payload: selectedElements.map((el) => el.id),
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

// ── Underlay controls ────────────────────────────────────────

function UnderlayControls({
  state,
  dispatch,
}: {
  state: EditorState;
  dispatch: Dispatch<FloorPlanAction>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: "SET_UNDERLAY",
        payload: { dataUrl: reader.result as string, opacity: 0.3 },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Blueprint Underlay
      </h3>

      {state.underlay ? (
        <div className="mt-2 space-y-2">
          <div>
            <Label className="text-xs">
              Opacity ({Math.round(state.underlay.opacity * 100)}%)
            </Label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(state.underlay.opacity * 100)}
              onChange={(e) =>
                dispatch({
                  type: "SET_UNDERLAY_OPACITY",
                  payload: Number(e.target.value) / 100,
                })
              }
              className="mt-1 w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
            >
              Replace
            </button>
            <button
              onClick={() => dispatch({ type: "REMOVE_UNDERLAY" })}
              className="flex-1 rounded-md border border-border px-2 py-1 text-xs text-pink-500 hover:bg-pink-500/10"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 w-full rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-brand hover:text-foreground"
        >
          Upload image to trace over
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
