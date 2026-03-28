import type {
  FlowchartDiagram,
  FlowchartNode,
  FlowchartEdge,
  NodeShapeType,
  AnchorPosition,
} from "./types";
import { DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE } from "./constants";

export interface FlowchartTemplate {
  id: string;
  name: string;
  description: string;
  diagram: Omit<FlowchartDiagram, "id">;
}

// ── Helpers ──────────────────────────────────────────────────

let _seq = 0;
function tid(): string {
  return `tpl-${Date.now()}-${_seq++}`;
}

function node(
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  shape: NodeShapeType,
  fill: string,
  z: number
): FlowchartNode {
  return {
    id: tid(),
    shape,
    x,
    y,
    width: w,
    height: h,
    text,
    style: { ...DEFAULT_NODE_STYLE, fill },
    rotation: 0,
    locked: false,
    zIndex: z,
  };
}

function edge(
  src: FlowchartNode,
  srcAnchor: AnchorPosition,
  tgt: FlowchartNode,
  tgtAnchor: AnchorPosition,
  label = "",
  z = 0
): FlowchartEdge {
  return {
    id: tid(),
    sourceNodeId: src.id,
    sourceAnchor: srcAnchor,
    targetNodeId: tgt.id,
    targetAnchor: tgtAnchor,
    routeType: "bezier",
    controlPoints: [],
    label,
    style: { ...DEFAULT_EDGE_STYLE },
    zIndex: z,
  };
}

// ── 1. Simple Flowchart ─────────────────────────────────────

function createSimpleFlowchart(): Omit<FlowchartDiagram, "id"> {
  const start = node(200, 40, 160, 60, "Start", "terminal", "#d1fae5", 0);
  const process1 = node(200, 150, 160, 80, "Step 1", "process", "#ffffff", 1);
  const decision = node(220, 290, 120, 100, "Condition?", "decision", "#fef9c3", 2);
  const process2 = node(200, 440, 160, 80, "Step 2", "process", "#ffffff", 3);
  const process3 = node(420, 300, 160, 80, "Step 3", "process", "#dbeafe", 4);
  const end = node(200, 580, 160, 60, "End", "terminal", "#fce7f3", 5);

  const nodes = [start, process1, decision, process2, process3, end];
  const edges = [
    edge(start, "bottom", process1, "top"),
    edge(process1, "bottom", decision, "top"),
    edge(decision, "bottom", process2, "top", "Yes"),
    edge(decision, "right", process3, "left", "No"),
    edge(process2, "bottom", end, "top"),
    edge(process3, "bottom", end, "right"),
  ];

  return {
    name: "Simple Flowchart",
    nodes,
    edges,
    gridSize: 20,
    gridSnap: true,
    gridVisible: true,
    backgroundColor: "#ffffff",
  };
}

// ── 2. Decision Tree ────────────────────────────────────────

function createDecisionTree(): Omit<FlowchartDiagram, "id"> {
  const root = node(260, 40, 160, 80, "Problem Analysis", "process", "#dbeafe", 0);
  const d1 = node(280, 180, 120, 100, "Is it urgent?", "decision", "#fef9c3", 1);
  const yes1 = node(80, 340, 160, 80, "Escalate to Manager", "process", "#fce7f3", 2);
  const no1 = node(440, 340, 120, 100, "Has workaround?", "decision", "#fef9c3", 3);
  const yes2 = node(320, 500, 160, 80, "Document Workaround", "io", "#d1fae5", 4);
  const no2 = node(560, 500, 160, 80, "Schedule Fix", "process", "#ede9fe", 5);
  const end1 = node(80, 480, 160, 60, "Done", "terminal", "#d1fae5", 6);
  const end2 = node(320, 640, 160, 60, "Done", "terminal", "#d1fae5", 7);
  const end3 = node(560, 640, 160, 60, "Done", "terminal", "#d1fae5", 8);

  const nodes = [root, d1, yes1, no1, yes2, no2, end1, end2, end3];
  const edges = [
    edge(root, "bottom", d1, "top"),
    edge(d1, "left", yes1, "top", "Yes"),
    edge(d1, "right", no1, "top", "No"),
    edge(yes1, "bottom", end1, "top"),
    edge(no1, "bottom", yes2, "top", "Yes"),
    edge(no1, "right", no2, "left", "No"),
    edge(yes2, "bottom", end2, "top"),
    edge(no2, "bottom", end3, "top"),
  ];

  return {
    name: "Decision Tree",
    nodes,
    edges,
    gridSize: 20,
    gridSnap: true,
    gridVisible: true,
    backgroundColor: "#ffffff",
  };
}

// ── 3. Process Map ──────────────────────────────────────────

function createProcessMap(): Omit<FlowchartDiagram, "id"> {
  const start = node(200, 40, 160, 60, "Customer Request", "terminal", "#d1fae5", 0);
  const input = node(200, 150, 160, 80, "Receive Input", "io", "#dbeafe", 1);
  const validate = node(220, 290, 120, 100, "Valid?", "decision", "#fef9c3", 2);
  const reject = node(440, 300, 160, 80, "Send Error Notice", "document", "#fce7f3", 3);
  const process = node(200, 440, 160, 80, "Process Request", "predefined-process", "#ede9fe", 4);
  const review = node(220, 580, 120, 100, "Approved?", "decision", "#fef9c3", 5);
  const output = node(200, 740, 160, 80, "Generate Output", "io", "#dbeafe", 6);
  const end = node(200, 880, 160, 60, "Deliver to Customer", "terminal", "#d1fae5", 7);
  const revise = node(440, 600, 160, 80, "Revise", "manual-input", "#ccfbf1", 8);

  const nodes = [start, input, validate, reject, process, review, output, end, revise];
  const edges = [
    edge(start, "bottom", input, "top"),
    edge(input, "bottom", validate, "top"),
    edge(validate, "bottom", process, "top", "Yes"),
    edge(validate, "right", reject, "left", "No"),
    edge(process, "bottom", review, "top"),
    edge(review, "bottom", output, "top", "Yes"),
    edge(review, "right", revise, "left", "No"),
    edge(revise, "top", process, "right"),
    edge(output, "bottom", end, "top"),
  ];

  return {
    name: "Process Map",
    nodes,
    edges,
    gridSize: 20,
    gridSnap: true,
    gridVisible: true,
    backgroundColor: "#ffffff",
  };
}

// ── 4. SDLC (Software Development Lifecycle) ────────────────

function createSdlc(): Omit<FlowchartDiagram, "id"> {
  const plan = node(200, 40, 160, 80, "Planning", "preparation", "#fef3c7", 0);
  const requirements = node(200, 170, 160, 80, "Requirements", "document", "#dbeafe", 1);
  const design = node(200, 300, 160, 80, "Design", "process", "#ede9fe", 2);
  const develop = node(200, 430, 160, 80, "Development", "process", "#ffffff", 3);
  const test = node(220, 570, 120, 100, "Testing", "decision", "#fef9c3", 4);
  const fix = node(440, 440, 160, 80, "Fix Bugs", "manual-input", "#fce7f3", 5);
  const deploy = node(200, 720, 160, 80, "Deployment", "predefined-process", "#d1fae5", 6);
  const maintain = node(200, 850, 160, 80, "Maintenance", "process", "#e0f2fe", 7);
  const db = node(440, 720, 100, 120, "Production DB", "database", "#e0f2fe", 8);

  const nodes = [plan, requirements, design, develop, test, fix, deploy, maintain, db];
  const edges = [
    edge(plan, "bottom", requirements, "top"),
    edge(requirements, "bottom", design, "top"),
    edge(design, "bottom", develop, "top"),
    edge(develop, "bottom", test, "top"),
    edge(test, "right", fix, "left", "Fail"),
    edge(fix, "top", develop, "right"),
    edge(test, "bottom", deploy, "top", "Pass"),
    edge(deploy, "right", db, "left"),
    edge(deploy, "bottom", maintain, "top"),
    edge(maintain, "top", plan, "right"),
  ];

  return {
    name: "SDLC",
    nodes,
    edges,
    gridSize: 20,
    gridSnap: true,
    gridVisible: true,
    backgroundColor: "#ffffff",
  };
}

// ── Exported templates array ────────────────────────────────

export const FLOWCHART_TEMPLATES: FlowchartTemplate[] = [
  {
    id: "simple-flowchart",
    name: "Simple Flowchart",
    description: "Basic start → process → decision → end flow",
    diagram: createSimpleFlowchart(),
  },
  {
    id: "decision-tree",
    name: "Decision Tree",
    description: "Multi-branch decision tree with outcomes",
    diagram: createDecisionTree(),
  },
  {
    id: "process-map",
    name: "Process Map",
    description: "End-to-end process with validation and review",
    diagram: createProcessMap(),
  },
  {
    id: "sdlc",
    name: "SDLC",
    description: "Software development lifecycle with testing loop",
    diagram: createSdlc(),
  },
];
