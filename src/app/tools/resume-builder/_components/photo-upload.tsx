"use client";

import type { Dispatch } from "react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import type { ResumeAction } from "@/lib/resume/types";

interface PhotoUploadProps {
  photoUrl: string | null;
  dispatch: Dispatch<ResumeAction>;
}

const MAX_SIZE_BYTES = 512 * 1024; // 512 KB

export function PhotoUpload({ photoUrl, dispatch }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_SIZE_BYTES) {
        alert("Photo must be under 512 KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        dispatch({ type: "SET_PHOTO", payload: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [dispatch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  if (photoUrl) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={photoUrl}
          alt="Profile photo"
          className="size-10 rounded-full object-cover"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "SET_PHOTO", payload: null })}
        >
          <X className="size-3.5" data-icon="inline-start" />
          Remove
        </Button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="size-3.5" data-icon="inline-start" />
        Upload Photo
      </Button>
    </>
  );
}
