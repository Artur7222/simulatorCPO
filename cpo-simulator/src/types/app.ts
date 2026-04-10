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

export interface AppState {
  currentScreen: TopLevelScreenId;
  diagnosticStep: DiagnosticStepId;
  simulatorStep: SimulatorStepId;
}
