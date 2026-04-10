import type { DiagnosticRecommendation, DiagnosticResult } from "../types/diagnostic";
import type { SimulatorAnswer, SimulatorSkillContent, SimulatorSkillResult, SkillId } from "../types/simulator";
import type { AppState, DiagnosticStepId, SimulatorStepId, TopLevelScreenId, User } from "../types/app";

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
  simulatorResults: []
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

export function setCurrentUser(user: User | null): void {
  state.currentUser = user;
}

export function setSelectedSkillIds(skillIds: SkillId[]): void {
  state.selectedSkillIds = skillIds;
}

export function setCurrentSkillId(skillId: SkillId | null): void {
  state.currentSkillId = skillId;
}

export function setSimulatorSkills(skills: SimulatorSkillContent[]): void {
  state.simulatorSkills = skills;
}

export function setDiagnosticResults(results: DiagnosticResult[]): void {
  state.diagnosticResults = results;
}

export function setDiagnosticRecommendations(recommendations: DiagnosticRecommendation[]): void {
  state.diagnosticRecommendations = recommendations;
}

export function setSimulatorResults(results: SimulatorSkillResult[]): void {
  state.simulatorResults = results;
}

export function upsertSimulatorAnswer(answer: SimulatorAnswer): void {
  const index = state.simulatorAnswers.findIndex(
    (item) => item.skillId === answer.skillId && item.blockId === answer.blockId
  );
  if (index === -1) {
    state.simulatorAnswers.push(answer);
    return;
  }
  state.simulatorAnswers[index] = answer;
}
