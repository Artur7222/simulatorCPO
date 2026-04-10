export interface DiagnosticTask {
  id: string;
  skillName: string;
  question: string;
}

export interface DiagnosticAnswer {
  taskId: string;
  text: string;
}

export interface DiagnosticResult {
  skillName: string;
  score: number;
  comment: string;
}
