"use client";

import type { Dispatch } from "react";
import type {
  FloorPlanElement,
  FloorPlanAction,
  MeasurementUnit,
} from "@/lib/floor-plan/types";
import { RoomRenderer } from "./room-renderer";
import { FurnitureRenderer } from "./furniture-renderer";
import { WallRenderer } from "./wall-renderer";
import { TextRenderer } from "./text-renderer";

interface ElementRendererProps {
  element: FloorPlanElement;
  isSelected: boolean;
  unit: MeasurementUnit;
  showDimensions: boolean;
  zoom: number;
  dispatch: Dispatch<FloorPlanAction>;
  onElementMouseDown: (elementId: string, e: React.MouseEvent) => void;
}

export function ElementRenderer({
  element,
  isSelected,
  unit,
  showDimensions,
  zoom,
  onElementMouseDown,
}: ElementRendererProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    onElementMouseDown(element.id, e);
  };

  switch (element.type) {
    case "room":
      return (
        <RoomRenderer
          element={element}
          isSelected={isSelected}
          unit={unit}
          showDimensions={showDimensions}
          zoom={zoom}
          onMouseDown={handleMouseDown}
        />
      );

    case "furniture":
      return (
        <FurnitureRenderer
          element={element}
          isSelected={isSelected}
          zoom={zoom}
          onMouseDown={handleMouseDown}
        />
      );

    case "wall":
      return (
        <WallRenderer
          element={element}
          isSelected={isSelected}
          zoom={zoom}
          onMouseDown={handleMouseDown}
        />
      );

    case "text":
      return (
        <TextRenderer
          element={element}
          isSelected={isSelected}
          zoom={zoom}
          onMouseDown={handleMouseDown}
        />
      );

    default:
      return null;
  }
}
