"use client";

import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolGuideButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ToolGuideButton({ isOpen, onToggle }: ToolGuideButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      title={isOpen ? "Close guide" : "Open guide"}
      className={isOpen ? "text-brand" : ""}
    >
      <CircleHelp className="size-4" />
    </Button>
  );
}
