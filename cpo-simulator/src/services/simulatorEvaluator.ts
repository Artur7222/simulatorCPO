export interface SimulatorEvaluationInput {
  skillId: string;
}

export interface SimulatorEvaluationOutput {
  percentage: number;
}

export function evaluateSimulatorSkill(
  _input: SimulatorEvaluationInput
): SimulatorEvaluationOutput {
  return { percentage: 0 };
}
