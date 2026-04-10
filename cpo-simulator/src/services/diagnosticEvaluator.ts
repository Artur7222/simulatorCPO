export interface AiEvaluationRequest {
  answers: Array<{ taskId: string; text: string }>;
}

export interface AiEvaluationResponse {
  summary: string;
}

export async function evaluateDiagnosticAnswers(
  _request: AiEvaluationRequest
): Promise<AiEvaluationResponse> {
  return Promise.resolve({
    summary: "Заглушка оценки диагностики."
  });
}

// TODO: заменить на корпоративный AI API
// TODO: добавить калибровку оценок
