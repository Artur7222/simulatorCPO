export interface DiagnosticTask {
  id: string;
  order: number;
  skillName: string;
  question: string;
  guidance?: string;
}

export interface DiagnosticScoringRule {
  skillName: string;
  minScore: number;
  maxScore: number;
  rubric: string;
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
  introText: string;
  tasks: DiagnosticTask[];
  scoringRules: DiagnosticScoringRule[];
}
