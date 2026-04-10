import type { AppState, DiagnosticStepId, SimulatorStepId, TopLevelScreenId } from "../types/app";

const state: AppState = {
  currentScreen: "diagnostic",
  diagnosticStep: "diagnostic-intro",
  simulatorStep: "simulator-skills"
};

export function getAppState(): AppState {
  return state;
}

export function setTopLevelScreen(screen: TopLevelScreenId): void {
  state.currentScreen = screen;
}

export function setDiagnosticStep(step: DiagnosticStepId): void {
  state.diagnosticStep = step;
}

export function setSimulatorStep(step: SimulatorStepId): void {
  state.simulatorStep = step;
}
