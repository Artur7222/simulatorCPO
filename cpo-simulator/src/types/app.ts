export type TopLevelScreenId = "diagnostic" | "simulator";

export type DiagnosticStepId =
  | "diagnostic-intro"
  | "diagnostic-task"
  | "diagnostic-processing"
  | "diagnostic-results";

export type SimulatorStepId =
  | "simulator-skills"
  | "simulator-session"
  | "simulator-results";

export interface User {
  id: string;
  fullName: string;
}

export interface AppState {
  currentScreen: TopLevelScreenId;
  diagnosticStep: DiagnosticStepId;
  simulatorStep: SimulatorStepId;
}
