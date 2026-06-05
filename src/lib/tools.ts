import type { Tool } from "@/types";

/**
 * Canonical list of top-level tools. Single source of truth shared by the
 * homepage directory and the house-ad inventory (`src/lib/house-ads.ts`), so a
 * new tool added here automatically appears in both places.
 */
export const TOOLS: Tool[] = [
  {
    name: "Invoice Generator",
    slug: "invoice-generator",
    description:
      "Create professional invoices with custom templates, tax calculations, and instant PDF export.",
    category: "Business",
    icon: "FileText",
    paidAlternative: "FreshBooks",
  },
  {
    name: "Pay Stub Generator",
    slug: "pay-stub-generator",
    description:
      "Generate professional pay stubs with earnings, deductions, YTD tracking, and instant PDF export.",
    category: "Business",
    icon: "Receipt",
    paidAlternative: "PayStubCreator",
  },
  {
    name: "Resume Builder",
    slug: "resume-builder",
    description:
      "Build professional, ATS-friendly resumes with multiple templates and instant PDF export.",
    category: "Career",
    icon: "FileUser",
    paidAlternative: "Resume.io",
  },
  {
    name: "Audio Editor",
    slug: "audio-editor",
    description:
      "Edit, trim, merge, and convert audio files with a visual waveform editor. Export as WAV, MP3, or OGG.",
    category: "Media",
    icon: "AudioLines",
    paidAlternative: "Adobe Audition",
  },
  {
    name: "OCR Scanner",
    slug: "ocr-scanner",
    description:
      "Extract text from images and scanned PDFs with browser-based OCR. Export as .txt, .docx, or searchable PDF.",
    category: "Document",
    icon: "ScanText",
    paidAlternative: "Adobe Acrobat",
  },
  {
    name: "Interactive Periodic Table",
    slug: "periodic-table",
    description:
      "Explore all 118 elements with temperature phase changes, property heatmaps, molar mass calculator, and data export.",
    category: "Education",
    icon: "Atom",
    paidAlternative: "Merck PTE",
  },
  {
    name: "Graphing Calculator",
    slug: "graphing-calculator",
    description:
      "Plot functions, run statistics, solve matrices, and compute distributions — TI-84 workflow with a modern HD interface.",
    category: "Education",
    icon: "LineChart",
    paidAlternative: "TI-84 Online",
  },
  {
    name: "Screen Recorder",
    slug: "screen-recorder",
    description:
      "Record your screen, window, or tab with a webcam picture-in-picture overlay. Trim and export as WebM, MP4, or GIF.",
    category: "Media",
    icon: "Video",
    paidAlternative: "Loom",
  },
  {
    name: "Media Toolkit",
    slug: "media-toolkit",
    description:
      "Merge, convert, compress, and trim audio and video files. Combine audiobook MP3s into a single M4A, convert formats, extract audio — all in your browser.",
    category: "Media",
    icon: "Clapperboard",
    paidAlternative: "Adobe Media Encoder",
  },
  {
    name: "Unit Converter",
    slug: "unit-converter",
    description:
      "Convert between 800+ units across 23 categories — length, weight, temperature, plus engineering and scientific units like viscosity, torque, and thermal conductivity.",
    category: "Utility",
    icon: "Ruler",
    paidAlternative: "Wolfram Alpha",
  },
  {
    name: "Floor Plan Maker",
    slug: "floor-plan-maker",
    description:
      "Design room layouts with drag-and-drop furniture, walls, and rooms. Export as SVG, PNG, or PDF.",
    category: "Design",
    icon: "LayoutGrid",
    paidAlternative: "SmartDraw",
    badge: "Under Construction",
  },
  {
    name: "Flowchart Maker",
    slug: "flowchart-maker",
    description:
      "Create flowcharts, process diagrams, and decision trees with smart connection routing. Export as SVG, PNG, or PDF.",
    category: "Design",
    icon: "GitBranch",
    paidAlternative: "Lucidchart",
    badge: "Under Construction",
  },
];
