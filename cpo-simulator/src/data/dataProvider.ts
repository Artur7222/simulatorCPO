import type { DiagnosticDataBundle } from "../types/diagnostic";
import type { SimulatorSkillContent } from "../types/simulator";

export interface DataProvider {
  loadDiagnosticSources(excelFile: File, wordFile: File): Promise<void>;
  getDiagnosticBundle(): DiagnosticDataBundle | null;
  loadSimulatorSource(wordFile: File): Promise<void>;
  getSimulatorSkills(): SimulatorSkillContent[];
}
