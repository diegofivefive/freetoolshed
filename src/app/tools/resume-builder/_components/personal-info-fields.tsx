"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PersonalInfo, ResumeAction } from "@/lib/resume/types";
import { PhotoUpload } from "./photo-upload";

interface PersonalInfoFieldsProps {
  personalInfo: PersonalInfo;
  dispatch: Dispatch<ResumeAction>;
}

export function PersonalInfoFields({ personalInfo, dispatch }: PersonalInfoFieldsProps) {
  const update = (field: keyof PersonalInfo, value: string) => {
    dispatch({ type: "SET_PERSONAL_INFO", payload: { [field]: value } });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Personal Information</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="resume-name">Full Name</Label>
          <Input
            id="resume-name"
            placeholder="John Smith"
            value={personalInfo.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resume-title">Job Title / Headline</Label>
          <Input
            id="resume-title"
            placeholder="Senior Software Engineer"
            value={personalInfo.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="resume-email">Email</Label>
          <Input
            id="resume-email"
            type="email"
            placeholder="john@example.com"
            value={personalInfo.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resume-phone">Phone</Label>
          <Input
            id="resume-phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={personalInfo.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="resume-location">Location</Label>
          <Input
            id="resume-location"
            placeholder="New York, NY"
            value={personalInfo.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resume-website">Website</Label>
          <Input
            id="resume-website"
            type="url"
            placeholder="https://example.com"
            value={personalInfo.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="resume-linkedin">LinkedIn</Label>
          <Input
            id="resume-linkedin"
            placeholder="linkedin.com/in/johnsmith"
            value={personalInfo.linkedin}
            onChange={(e) => update("linkedin", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Photo</Label>
          <PhotoUpload
            photoUrl={personalInfo.photoUrl}
            dispatch={dispatch}
          />
        </div>
      </div>
    </div>
  );
}
