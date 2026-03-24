"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export function ExportButton({
  onClick,
  label = "Download",
  disabled = false,
}: ExportButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <Download className="size-4" data-icon="inline-start" />
      {label}
    </Button>
  );
}
