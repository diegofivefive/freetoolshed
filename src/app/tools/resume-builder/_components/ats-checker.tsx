"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, CheckCircle2, XCircle, Sparkles, Trash2 } from "lucide-react";
import {
  extractResumeText,
  extractKeywords,
  checkAtsMatch,
} from "@/lib/resume/ats-checker";
import type { AtsResult } from "@/lib/resume/ats-checker";
import type { ResumeData } from "@/lib/resume/types";

interface AtsCheckerProps {
  state: ResumeData;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-pink-400";
  const bgColor =
    score >= 70 ? "stroke-emerald-500/15" : score >= 40 ? "stroke-amber-500/15" : "stroke-pink-400/15";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={100} height={100} className="-rotate-90">
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          className={bgColor}
          strokeWidth={8}
        />
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-700`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${color}`}>{score}%</span>
        <span className="text-xs text-muted-foreground">match</span>
      </div>
    </div>
  );
}

function ScoreLabel({ score }: { score: number }) {
  if (score >= 70) return <span className="text-sm font-medium text-emerald-500">Strong match</span>;
  if (score >= 40) return <span className="text-sm font-medium text-amber-500">Moderate match</span>;
  return <span className="text-sm font-medium text-pink-400">Weak match — add missing keywords</span>;
}

export function AtsChecker({ state }: AtsCheckerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AtsResult | null>(null);

  const resumeText = useMemo(() => extractResumeText(state), [state]);

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;
    const keywords = extractKeywords(jobDescription);
    const atsResult = checkAtsMatch(resumeText, keywords);
    setResult(atsResult);
  };

  const handleClear = () => {
    setJobDescription("");
    setResult(null);
  };

  // Re-analyze live when resume changes (if we already have a result)
  const liveResult = useMemo(() => {
    if (!result || !jobDescription.trim()) return result;
    const keywords = extractKeywords(jobDescription);
    return checkAtsMatch(resumeText, keywords);
  }, [resumeText, result, jobDescription]);

  const displayResult = liveResult ?? result;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-start gap-2">
        <Target className="mt-0.5 size-4 shrink-0 text-brand" />
        <div>
          <p className="text-sm font-semibold">ATS Keyword Checker</p>
          <p className="text-xs text-muted-foreground">
            Paste a job description to see how well your resume matches its keywords.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="job-description">Job Description</Label>
        <Textarea
          id="job-description"
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          className="resize-y text-sm"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleAnalyze}
            disabled={!jobDescription.trim()}
            className="gap-1.5"
          >
            <Sparkles className="size-3.5" />
            Analyze Match
          </Button>
          {displayResult && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          )}
          {jobDescription.trim() && (
            <span className="text-xs text-muted-foreground">
              {jobDescription.trim().split(/\s+/).length} words
            </span>
          )}
        </div>
      </div>

      {displayResult && (
        <>
          <Separator />

          {/* Score */}
          <div className="flex items-center gap-6">
            <ScoreRing score={displayResult.score} />
            <div className="space-y-1">
              <ScoreLabel score={displayResult.score} />
              <p className="text-xs text-muted-foreground">
                {displayResult.matched.length} of {displayResult.totalKeywords} keywords found in your resume
              </p>
            </div>
          </div>

          <Separator />

          {/* Missing keywords */}
          {displayResult.missing.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <XCircle className="size-3.5 text-pink-400" />
                <p className="text-sm font-semibold">
                  Missing Keywords ({displayResult.missing.length})
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Consider adding these to your resume — in your summary, skills, or experience bullets.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {displayResult.missing.map((kw) => (
                  <Badge
                    key={kw.keyword}
                    variant="outline"
                    className="border-pink-400/30 bg-pink-500/5 text-pink-400"
                  >
                    {kw.keyword}
                    {kw.frequency > 1 && (
                      <span className="ml-1 opacity-60">×{kw.frequency}</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Matched keywords */}
          {displayResult.matched.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <p className="text-sm font-semibold">
                  Matched Keywords ({displayResult.matched.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {displayResult.matched.map((kw) => (
                  <Badge
                    key={kw.keyword}
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
                  >
                    {kw.keyword}
                    {kw.frequency > 1 && (
                      <span className="ml-1 opacity-60">×{kw.frequency}</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
