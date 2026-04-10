export type SkillId = string;

export interface Skill {
  id: SkillId;
  title: string;
}

export interface SimulatorSkillResult {
  skillId: SkillId;
  percentage: number;
}
