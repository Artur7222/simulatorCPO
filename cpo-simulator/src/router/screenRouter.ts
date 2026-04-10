import { setDiagnosticStep, setSimulatorStep, setTopLevelScreen } from "../state/appState";
import type { DiagnosticStepId, SimulatorStepId, TopLevelScreenId } from "../types/app";

export function goToTopLevelScreen(screen: TopLevelScreenId): void {
  setTopLevelScreen(screen);
}

export function goToDiagnosticStep(step: DiagnosticStepId): void {
  setDiagnosticStep(step);
}

export function goToSimulatorStep(step: SimulatorStepId): void {
  setSimulatorStep(step);
}
