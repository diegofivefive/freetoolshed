"use client";

import { useCallback, useState, type Dispatch } from "react";
import { FileUpload } from "@/components/shared/file-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageIcon, X } from "lucide-react";
import type { InvoiceAction } from "@/lib/invoice/types";

interface LogoUploadProps {
  logoUrl: string | null;
  dispatch: Dispatch<InvoiceAction>;
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function LogoUpload({ logoUrl, dispatch }: LogoUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setError(null);
      try {
        const dataUrl = await resizeImage(file, 200);
        dispatch({ type: "SET_LOGO", payload: dataUrl });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load logo. Try a different image."
        );
      }
    },
    [dispatch]
  );

  const handleRemove = () => {
    setError(null);
    dispatch({ type: "SET_LOGO", payload: null });
  };

  return (
    <div className="space-y-3">
      <Label>Company Logo</Label>

      {logoUrl ? (
        <div className="flex items-start gap-4">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-border bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Company logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Logo will appear on your invoice and PDF.
            </p>
            <Button variant="outline" size="sm" onClick={handleRemove}>
              <X className="size-3.5" data-icon="inline-start" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <FileUpload
          accept="image/png,image/jpeg,image/svg+xml"
          maxSizeMB={2}
          onFiles={handleFiles}
          className="py-6"
        >
          <ImageIcon className="mb-2 size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Upload your logo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPEG, or SVG — max 2MB
          </p>
        </FileUpload>
      )}

      {error && (
        <p className="text-xs text-pink-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
