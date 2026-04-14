import type { SimulatorAnswer, SimulatorSkillContent } from "../types/simulator";

export interface SimulatorEvaluationInput {
  skill: SimulatorSkillContent;
  answers: SimulatorAnswer[];
}

export interface SimulatorEvaluationOutput {
  percentage: number;
  completedBlocks: number;
  totalBlocks: number;
  openQuestionStatus: string;
}

export function evaluateSimulatorSkill(
  input: SimulatorEvaluationInput
): SimulatorEvaluationOutput {
  const choiceBlocks = input.skill.blocks.filter((block) => block.type === "choice-question");
  const openBlocks = input.skill.blocks.filter((block) => block.type === "open-question");
  let correct = 0;
  choiceBlocks.forEach((block) => {
    const answer = input.answers.find((item) => item.blockId === block.id)?.value ?? "";
    if (Number(answer) === block.correctOptionIndex) {
      correct += 1;
    }
  });
  const percentage = choiceBlocks.length === 0 ? 0 : Math.round((correct / choiceBlocks.length) * 100);
  const openCompleted = openBlocks.filter((block) => {
    const text = input.answers.find((item) => item.blockId === block.id)?.value ?? "";
    return text.trim().length >= block.minLength;
  }).length;
  const openQuestionStatus =
    openBlocks.length === 0
      ? "Открытые вопросы отсутствуют."
      : openCompleted === openBlocks.length
        ? "Открытые ответы заполнены содержательно."
        : "Часть открытых ответов требует доработки.";
  return {
    percentage,
    completedBlocks: input.answers.length,
    totalBlocks: input.skill.blocks.length,
    openQuestionStatus
  };
}
