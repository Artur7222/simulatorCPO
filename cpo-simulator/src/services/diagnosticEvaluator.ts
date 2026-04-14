import type {
  DiagnosticDataBundle,
  DiagnosticRecommendation,
  DiagnosticResult,
  DiagnosticTaskRubric
} from "../types/diagnostic";

export interface AiEvaluationRequest {
  bundle: DiagnosticDataBundle;
  answers: Array<{ taskId: string; text: string }>;
}

export interface AiEvaluationResponse {
  summary: string;
  results: DiagnosticResult[];
  recommendations: DiagnosticRecommendation[];
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function getTaskRubric(bundle: DiagnosticDataBundle, taskId: string): DiagnosticTaskRubric | null {
  return bundle.taskRubrics.find((item) => item.taskId === taskId) ?? null;
}

function criterionCompletion(answerText: string, keywords: string[], minHits: number): number {
  if (keywords.length === 0) return 0;
  const normalized = normalizeText(answerText);
  const hits = keywords.filter((word) => normalized.includes(word.toLowerCase())).length;
  const threshold = Math.max(1, minHits);
  return Math.min(1, hits / threshold);
}

function evaluateTaskScore(bundle: DiagnosticDataBundle, taskId: string, text: string): number {
  const rubric = getTaskRubric(bundle, taskId);
  if (!rubric || rubric.criteria.length === 0) return 0;
  const normalized = normalizeText(text);
  const totalWeight = rubric.criteria.reduce((acc, item) => acc + item.weight, 0) || 1;
  const weighted = rubric.criteria.reduce((acc, criterion) => {
    const keywordScore = criterionCompletion(
      normalized,
      criterion.evidenceKeywords,
      criterion.minKeywordHits ?? 1
    );
    const failHit = (criterion.failSignals ?? []).some((signal) => normalized.includes(signal.toLowerCase()));
    const penalty = failHit ? 0.25 : 0;
    const finalCriterionScore = Math.max(0, keywordScore - penalty);
    return acc + finalCriterionScore * criterion.weight;
  }, 0);
  return Math.max(0, Math.min(1, weighted / totalWeight));
}

export async function evaluateDiagnosticAnswers(
  request: AiEvaluationRequest
): Promise<AiEvaluationResponse> {
  const skillToScores = new Map<string, number[]>();
  const taskMap = new Map(request.bundle.tasks.map((task) => [task.id, task]));

  request.answers.forEach((answer) => {
    const task = taskMap.get(answer.taskId);
    if (!task) return;
    const score = evaluateTaskScore(request.bundle, answer.taskId, answer.text);
    const current = skillToScores.get(task.skillName) ?? [];
    current.push(score);
    skillToScores.set(task.skillName, current);
  });

  const results: DiagnosticResult[] = request.bundle.skillRules.map((rule) => {
    const scores = skillToScores.get(rule.skillName) ?? [];
    const avgNormalized = scores.length === 0
      ? 0
      : scores.reduce((acc, item) => acc + item, 0) / scores.length;
    const bounded = Math.max(1, Math.min(rule.maxScore, Math.round(avgNormalized * rule.maxScore)));
    return {
      skillName: rule.skillName,
      score: bounded,
      maxScore: rule.maxScore,
      comment: bounded <= 3
        ? "Критерии навыка раскрыты частично: добавьте структуру, логику расчета и явные выводы."
        : "Навык проявлен уверенно: структура и аргументация в целом соответствуют критериям."
    };
  });

  const skillWeights = new Map(request.bundle.skillRules.map((rule) => [rule.skillName, rule.weight]));
  const recommendations: DiagnosticRecommendation[] = [...results]
    .sort((left, right) => {
      const leftPriority = (6 - left.score) * (skillWeights.get(left.skillName) ?? 0);
      const rightPriority = (6 - right.score) * (skillWeights.get(right.skillName) ?? 0);
      return rightPriority - leftPriority;
    })
    .slice(0, 6)
    .map((item, index) => ({
      skillName: item.skillName,
      reason: item.score <= 3
        ? "Критерии навыка требуют первоочередной доработки по структуре и доказательной базе."
        : "Навык стоит закрепить дополнительной практикой на прикладных кейсах.",
      level: index < 3 ? "recommended" : "optional"
    }));

  const overallScore = Math.round(
    results.reduce((acc, result) => acc + result.score, 0) / Math.max(1, results.length)
  );

  return {
    summary: `Оценка сформирована по критериям задач (веса + сигналы качества). Итоговый уровень: ${overallScore}/6.`,
    results,
    recommendations
  };
}
