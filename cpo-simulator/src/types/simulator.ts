export type SkillId = string;

export interface Skill {
  id: SkillId;
  title: string;
  description?: string;
}

export type SimulatorBlockType =
  | "theory"
  | "case-description"
  | "choice-question"
  | "open-question"
  | "feedback";

export interface SimulatorBlockBase {
  id: string;
  type: SimulatorBlockType;
  title: string;
}

export interface TheoryBlock extends SimulatorBlockBase {
  type: "theory";
  content: string;
}

export interface CaseDescriptionBlock extends SimulatorBlockBase {
  type: "case-description";
  content: string;
}

export interface ChoiceQuestionBlock extends SimulatorBlockBase {
  type: "choice-question";
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface OpenQuestionBlock extends SimulatorBlockBase {
  type: "open-question";
  question: string;
  minLength: number;
}

export interface FeedbackBlock extends SimulatorBlockBase {
  type: "feedback";
  content: string;
}

export type SimulatorBlock =
  | TheoryBlock
  | CaseDescriptionBlock
  | ChoiceQuestionBlock
  | OpenQuestionBlock
  | FeedbackBlock;

export interface SimulatorSkillContent {
  skillId: SkillId;
  blocks: SimulatorBlock[];
}

export interface SimulatorAnswer {
  skillId: SkillId;
  blockId: string;
  value: string;
}

export interface SimulatorSkillResult {
  skillId: SkillId;
  percentage: number;
  completedBlocks: number;
  totalBlocks: number;
}
