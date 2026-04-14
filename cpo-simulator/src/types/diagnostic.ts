export interface DiagnosticTask {
  id: string;
  order: number;
  skillName: string;
  topic: string;
  question: string;
  guidance?: string;
  constraints?: string[];
  inputData?: DiagnosticTaskInputData;
}

export interface DiagnosticTaskInputData {
  contextLines?: string[];
  numericFacts?: Array<{ name: string; value: number; unit?: string }>;
  tableRows?: Array<Record<string, string | number>>;
}

export interface DiagnosticCriterion {
  id: string;
  title: string;
  weight: number;
  evidenceKeywords: string[];
  failSignals?: string[];
  minKeywordHits?: number;
}

export interface DiagnosticTaskRubric {
  taskId: string;
  criteria: DiagnosticCriterion[];
}

export interface DiagnosticSkillRule {
  skillName: string;
  maxScore: number;
  weight: number;
  rubricSummary: string;
}

export interface DiagnosticAnswer {
  taskId: string;
  text: string;
  updatedAt: string;
}

export interface DiagnosticResult {
  skillName: string;
  score: number;
  maxScore: number;
  comment: string;
}

export interface DiagnosticRecommendation {
  skillName: string;
  reason: string;
  level: "recommended" | "optional";
}

export interface DiagnosticDataBundle {
  meta: DiagnosticDatasetMeta;
  introText: string;
  caseDescription: string;
  tasks: DiagnosticTask[];
  taskRubrics: DiagnosticTaskRubric[];
  skillRules: DiagnosticSkillRule[];
}

export interface DiagnosticDatasetMeta {
  schemaVersion: string;
  sourceDescription: string;
  generatedAtIso: string;
}
