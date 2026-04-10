import type {
  DiagnosticAnswer,
  DiagnosticDataBundle,
  DiagnosticRecommendation,
  DiagnosticResult
} from "./diagnostic";
import type { SimulatorAnswer, SimulatorSkillContent, SimulatorSkillResult, SkillId } from "./simulator";

export type TopLevelScreenId = "diagnostic" | "simulator";

export type DiagnosticStepId =
  | "intro"
  | "task"
  | "processing"
  | "results";

export type SimulatorStepId =
  | "skills"
  | "session"
  | "results";

export interface User {
  id: string;
  fullName: string;
}

export interface ParsedExcelResult {
  isValid: boolean;
  errors: string[];
}

export interface ParsedWordResult {
  isValid: boolean;
  errors: string[];
}

export interface AiEvaluationRequest {
  answers: DiagnosticAnswer[];
}

export interface AiEvaluationResponse {
  summary: string;
  results: DiagnosticResult[];
  recommendations: DiagnosticRecommendation[];
}

export interface AppState {
  currentUser: User | null;
  currentScreen: TopLevelScreenId;
  diagnosticStep: DiagnosticStepId;
  simulatorStep: SimulatorStepId;
  diagnosticDataBundle: DiagnosticDataBundle | null;
  diagnosticAnswers: Record<string, DiagnosticAnswer>;
  diagnosticResults: DiagnosticResult[];
  diagnosticRecommendations: DiagnosticRecommendation[];
  selectedSkillIds: SkillId[];
  simulatorSkills: SimulatorSkillContent[];
  currentSkillId: SkillId | null;
  simulatorProgress: Record<SkillId, number>;
  simulatorAnswers: SimulatorAnswer[];
  simulatorResults: SimulatorSkillResult[];
}
