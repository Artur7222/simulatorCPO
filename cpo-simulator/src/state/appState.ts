import type { DiagnosticRecommendation, DiagnosticResult } from "../types/diagnostic";
import type { SimulatorAnswer, SimulatorSkillContent, SimulatorSkillResult, SkillId } from "../types/simulator";
import type { AppState, DiagnosticStepId, SimulatorStepId, TopLevelScreenId, User } from "../types/app";

type StateListener = (state: AppState) => void;
const listeners = new Set<StateListener>();

const state: AppState = {
  currentUser: null,
  currentScreen: "diagnostic",
  diagnosticStep: "intro",
  simulatorStep: "skills",
  diagnosticDataBundle: null,
  diagnosticAnswers: {},
  diagnosticResults: [],
  diagnosticRecommendations: [],
  selectedSkillIds: [],
  simulatorSkills: [],
  currentSkillId: null,
  simulatorProgress: {},
  simulatorAnswers: [],
  simulatorResults: [],
  diagnosticExcelFileName: null,
  diagnosticWordFileName: null,
  diagnosticUploadError: null
};

export function getAppState(): AppState {
  return state;
}

export function subscribeToAppState(listener: StateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyStateChanged(): void {
  listeners.forEach((listener) => {
    listener(state);
  });
}

export function setTopLevelScreen(screen: TopLevelScreenId): void {
  state.currentScreen = screen;
  notifyStateChanged();
}

export function setDiagnosticStep(step: DiagnosticStepId): void {
  state.diagnosticStep = step;
  notifyStateChanged();
}

export function setSimulatorStep(step: SimulatorStepId): void {
  state.simulatorStep = step;
  notifyStateChanged();
}

export function setCurrentUser(user: User | null): void {
  state.currentUser = user;
  notifyStateChanged();
}

export function setSelectedSkillIds(skillIds: SkillId[]): void {
  state.selectedSkillIds = skillIds;
  notifyStateChanged();
}

export function setCurrentSkillId(skillId: SkillId | null): void {
  state.currentSkillId = skillId;
  notifyStateChanged();
}

export function setSimulatorSkills(skills: SimulatorSkillContent[]): void {
  state.simulatorSkills = skills;
  notifyStateChanged();
}

export function setDiagnosticResults(results: DiagnosticResult[]): void {
  state.diagnosticResults = results;
  notifyStateChanged();
}

export function setDiagnosticRecommendations(recommendations: DiagnosticRecommendation[]): void {
  state.diagnosticRecommendations = recommendations;
  notifyStateChanged();
}

export function setSimulatorResults(results: SimulatorSkillResult[]): void {
  state.simulatorResults = results;
  notifyStateChanged();
}

export function setDiagnosticExcelFileName(fileName: string | null): void {
  state.diagnosticExcelFileName = fileName;
  notifyStateChanged();
}

export function setDiagnosticWordFileName(fileName: string | null): void {
  state.diagnosticWordFileName = fileName;
  notifyStateChanged();
}

export function setDiagnosticUploadError(error: string | null): void {
  state.diagnosticUploadError = error;
  notifyStateChanged();
}

export function upsertSimulatorAnswer(answer: SimulatorAnswer): void {
  const index = state.simulatorAnswers.findIndex(
    (item) => item.skillId === answer.skillId && item.blockId === answer.blockId
  );
  if (index === -1) {
    state.simulatorAnswers.push(answer);
    notifyStateChanged();
    return;
  }
  state.simulatorAnswers[index] = answer;
  notifyStateChanged();
}
