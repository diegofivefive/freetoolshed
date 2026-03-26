import type { ResumeData } from "./types";
import { stripHtml } from "./rich-text";

// Common filler words to exclude from keyword extraction
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "as", "is", "was", "are", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "shall", "can", "need", "must", "this", "that", "these", "those",
  "it", "its", "we", "our", "you", "your", "they", "their", "them", "he", "she",
  "his", "her", "who", "which", "what", "when", "where", "how", "why", "all",
  "each", "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "not", "only", "own", "same", "so", "than", "too", "very", "just", "about",
  "above", "after", "again", "also", "any", "because", "before", "between",
  "during", "if", "into", "over", "through", "under", "until", "up", "while",
  "able", "across", "along", "already", "among", "around", "become", "either",
  "etc", "get", "got", "include", "including", "like", "make", "making", "many",
  "much", "new", "per", "well", "within", "without", "work", "working", "using",
  "use", "used", "ensure", "strong", "preferred", "required", "plus", "ideal",
  "looking", "join", "team", "role", "position", "candidate", "company",
  "opportunity", "responsibilities", "qualifications", "requirements", "minimum",
  "experience", "years", "year", "month", "day", "time", "based", "related",
]);

// Multi-word technical terms that should be treated as single keywords
const COMPOUND_TERMS = [
  "machine learning", "deep learning", "natural language processing",
  "computer vision", "data science", "data engineering", "data analysis",
  "project management", "product management", "software engineering",
  "full stack", "front end", "back end", "ci cd", "ci/cd",
  "version control", "unit testing", "integration testing",
  "object oriented", "functional programming", "test driven",
  "agile methodology", "scrum master", "user experience", "user interface",
  "graphic design", "quality assurance", "business intelligence",
  "supply chain", "customer service", "account management",
  "financial analysis", "risk management", "cloud computing",
  "distributed systems", "real time", "cross functional",
  "stakeholder management", "problem solving", "critical thinking",
  "communication skills", "team leadership",
  "rest api", "restful api", "web services", "microservices",
  "react native", "vue js", "next js", "node js", "ruby on rails",
  "spring boot", "asp net", "dot net", ".net",
  "amazon web services", "google cloud", "microsoft azure",
  "power bi", "google analytics", "adobe creative suite",
];

export interface AtsKeyword {
  keyword: string;
  found: boolean;
  frequency: number; // times it appears in the job description
}

export interface AtsResult {
  score: number; // 0-100
  matched: AtsKeyword[];
  missing: AtsKeyword[];
  totalKeywords: number;
}

/** Normalize text: lowercase, collapse whitespace */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s/+#.'-]/g, " ").replace(/\s+/g, " ").trim();
}

/** Extract all text content from resume data */
export function extractResumeText(data: ResumeData): string {
  const parts: string[] = [];

  const { personalInfo } = data;
  parts.push(personalInfo.name, personalInfo.title);

  for (const section of data.sections) {
    if (!section.visible) continue;
    switch (section.type) {
      case "summary":
        parts.push(section.content);
        break;
      case "experience":
        for (const item of section.items) {
          parts.push(item.title, item.company, item.location);
          parts.push(...item.bullets);
        }
        break;
      case "education":
        for (const item of section.items) {
          parts.push(item.school, item.degree, item.field, item.description);
        }
        break;
      case "skills":
        for (const item of section.items) {
          parts.push(item.name);
        }
        break;
      case "certifications":
        for (const item of section.items) {
          parts.push(item.name, item.issuer);
        }
        break;
      case "languages":
        for (const item of section.items) {
          parts.push(item.name);
        }
        break;
      case "projects":
        for (const item of section.items) {
          parts.push(item.name, item.description);
          parts.push(...item.technologies);
        }
        break;
      case "volunteer":
        for (const item of section.items) {
          parts.push(item.organization, item.role, item.description);
        }
        break;
      case "awards":
        for (const item of section.items) {
          parts.push(item.title, item.issuer, item.description);
        }
        break;
      case "publications":
        for (const item of section.items) {
          parts.push(item.title, item.publisher);
        }
        break;
      case "references":
        for (const item of section.items) {
          parts.push(item.name, item.title, item.company);
        }
        break;
    }
  }

  return stripHtml(parts.filter(Boolean).join(" "));
}

/** Extract keywords from job description text */
export function extractKeywords(jobDescription: string): AtsKeyword[] {
  const normalized = normalize(jobDescription);
  const keywordMap = new Map<string, number>();

  // 1. Find compound terms first
  for (const term of COMPOUND_TERMS) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = normalized.match(regex);
    if (matches) {
      keywordMap.set(term.toLowerCase(), matches.length);
    }
  }

  // 2. Extract individual words (filter stop words and short words)
  const words = normalized.split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/^[^a-z0-9#+.]+|[^a-z0-9#+]+$/g, "").replace(/\.+$/, "");
    if (clean.length < 2) continue;
    if (STOP_WORDS.has(clean)) continue;
    // Skip pure numbers or number-like tokens (5+, 3-5, etc.)
    if (/^[\d+\-]+$/.test(clean)) continue;

    // Check if this word is already part of a matched compound term
    let partOfCompound = false;
    for (const [compound] of keywordMap) {
      if (compound.split(/\s+/).includes(clean)) {
        partOfCompound = true;
        break;
      }
    }
    if (partOfCompound) continue;

    keywordMap.set(clean, (keywordMap.get(clean) ?? 0) + 1);
  }

  // 3. Sort by frequency (higher = more important in the job description)
  const sorted = [...keywordMap.entries()]
    .sort((a, b) => b[1] - a[1]);

  // 4. Take top keywords (cap at 40 to avoid noise)
  return sorted.slice(0, 40).map(([keyword, frequency]) => ({
    keyword,
    found: false,
    frequency,
  }));
}

/** Check resume against extracted keywords */
export function checkAtsMatch(
  resumeText: string,
  keywords: AtsKeyword[]
): AtsResult {
  const normalizedResume = normalize(resumeText);

  const matched: AtsKeyword[] = [];
  const missing: AtsKeyword[] = [];

  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const found = regex.test(normalizedResume);
    if (found) {
      matched.push({ ...kw, found: true });
    } else {
      missing.push({ ...kw, found: false });
    }
  }

  const totalKeywords = keywords.length;
  const score = totalKeywords > 0 ? Math.round((matched.length / totalKeywords) * 100) : 0;

  return { score, matched, missing, totalKeywords };
}
