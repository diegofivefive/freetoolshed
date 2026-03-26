"use client";

import { type Dispatch, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExportButton } from "@/components/shared/export-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, FilePlus, Loader2, CircleAlert, X, Eye, EyeOff } from "lucide-react";
import { PersonalInfoFields } from "./personal-info-fields";
import { SummaryEditor } from "./summary-editor";
import { ExperienceEditor } from "./experience-editor";
import { EducationEditor } from "./education-editor";
import { SkillsEditor } from "./skills-editor";
import { CertificationsEditor } from "./certifications-editor";
import { LanguagesEditor } from "./languages-editor";
import { ProjectsEditor } from "./projects-editor";
import { VolunteerEditor } from "./volunteer-editor";
import { AwardsEditor } from "./awards-editor";
import { PublicationsEditor } from "./publications-editor";
import { ReferencesEditor } from "./references-editor";
import { SectionManager } from "./section-manager";
import { TemplateSelector } from "./template-selector";
import { ColorPicker } from "./color-picker";
import { FontSelector } from "./font-selector";
import { SpacingControls } from "./spacing-controls";
import { ResumeHistory } from "./resume-history";
import { AtsChecker } from "./ats-checker";
import { generateResumePdf, printResumePdf } from "./pdf-export";
import { SECTION_TYPE_LABELS } from "@/lib/resume/constants";
import type { ResumeData, ResumeAction, ResumeSection } from "@/lib/resume/types";

interface ResumeFormProps {
  state: ResumeData;
  dispatch: Dispatch<ResumeAction>;
  onNewResume: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

function SectionEditor({
  section,
  dispatch,
  dateFormat,
}: {
  section: ResumeSection;
  dispatch: Dispatch<ResumeAction>;
  dateFormat: string;
}) {
  switch (section.type) {
    case "summary":
      return <SummaryEditor section={section} dispatch={dispatch} />;
    case "experience":
      return <ExperienceEditor section={section} dispatch={dispatch} />;
    case "education":
      return <EducationEditor section={section} dispatch={dispatch} />;
    case "skills":
      return <SkillsEditor section={section} dispatch={dispatch} />;
    case "certifications":
      return <CertificationsEditor section={section} dispatch={dispatch} />;
    case "languages":
      return <LanguagesEditor section={section} dispatch={dispatch} />;
    case "projects":
      return <ProjectsEditor section={section} dispatch={dispatch} />;
    case "volunteer":
      return <VolunteerEditor section={section} dispatch={dispatch} />;
    case "awards":
      return <AwardsEditor section={section} dispatch={dispatch} />;
    case "publications":
      return <PublicationsEditor section={section} dispatch={dispatch} />;
    case "references":
      return <ReferencesEditor section={section} dispatch={dispatch} />;
    default:
      return null;
  }
}

export function ResumeForm({
  state,
  dispatch,
  onNewResume,
  showPreview,
  onTogglePreview,
}: ResumeFormProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfErrors, setPdfErrors] = useState<string[]>([]);

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true);
    setPdfErrors([]);
    try {
      const result = await generateResumePdf(state);
      if (!result.success) {
        setPdfErrors(result.errors);
      }
    } catch {
      setPdfErrors(["Failed to generate PDF. Please try again."]);
    } finally {
      setPdfLoading(false);
    }
  }, [state]);

  const handlePrint = useCallback(async () => {
    setPdfLoading(true);
    setPdfErrors([]);
    try {
      const result = await printResumePdf(state);
      if (!result.success) {
        setPdfErrors(result.errors);
      }
    } catch {
      setPdfErrors(["Failed to generate printable PDF. Please try again."]);
    } finally {
      setPdfLoading(false);
    }
  }, [state]);

  const visibleSections = [...state.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="ats">ATS</TabsTrigger>
        </TabsList>
        <div className="mt-2">
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={onTogglePreview}
            className="gap-1.5"
          >
            {showPreview ? (
              <Eye className="size-4" />
            ) : (
              <EyeOff className="size-4" />
            )}
            Preview
          </Button>
        </div>

        <TabsContent value="content">
          <div className="space-y-6 py-4">
            <PersonalInfoFields
              personalInfo={state.personalInfo}
              dispatch={dispatch}
            />
            {visibleSections.map((section) => (
              <div key={section.id}>
                <Separator className="mb-6" />
                {section.type !== "summary" && (
                  <h3 className="mb-3 text-sm font-semibold">
                    {SECTION_TYPE_LABELS[section.type]}
                  </h3>
                )}
                <SectionEditor
                  section={section}
                  dispatch={dispatch}
                  dateFormat={state.settings.dateFormat}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections">
          <div className="py-4">
            <SectionManager
              sections={state.sections}
              dispatch={dispatch}
            />
          </div>
        </TabsContent>

        <TabsContent value="style">
          <div className="space-y-6 py-4">
            <TemplateSelector
              template={state.settings.template}
              accentColor={state.settings.accentColor}
              dispatch={dispatch}
            />
            <Separator />
            <ColorPicker
              accentColor={state.settings.accentColor}
              dispatch={dispatch}
            />
            <Separator />
            <FontSelector
              fontFamily={state.settings.fontFamily}
              fontSize={state.settings.fontSize}
              dateFormat={state.settings.dateFormat}
              dispatch={dispatch}
            />
            <Separator />
            <SpacingControls
              marginSize={state.settings.marginSize}
              sectionSpacing={state.settings.sectionSpacing}
              lineSpacing={state.settings.lineSpacing}
              dispatch={dispatch}
            />
          </div>
        </TabsContent>

        <TabsContent value="ats">
          <AtsChecker state={state} />
        </TabsContent>
      </Tabs>

      {/* Toolbar */}
      <Separator />
      {pdfErrors.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-pink-400/30 bg-pink-500/5 px-4 py-3">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-pink-400" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-pink-400">
              Please fix before exporting:
            </p>
            <ul className="list-inside list-disc text-sm text-pink-400/80">
              {pdfErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setPdfErrors([])}
            className="shrink-0 rounded p-0.5 text-pink-400/60 hover:text-pink-400"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <ExportButton
          onClick={handleDownloadPdf}
          label={pdfLoading ? "Generating..." : "Download PDF"}
          disabled={pdfLoading || !state.personalInfo.name}
        />
        <Button variant="outline" onClick={handlePrint} disabled={pdfLoading}>
          {pdfLoading ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Printer className="size-4" data-icon="inline-start" />
          )}
          Print
        </Button>
        <ResumeHistory
          currentState={state}
          onLoad={(data) => dispatch({ type: "LOAD_DRAFT", payload: data })}
        />
        <div className="flex-1" />
        <Button variant="outline" onClick={onNewResume}>
          <FilePlus className="size-4" data-icon="inline-start" />
          New Resume
        </Button>
      </div>
    </div>
  );
}
