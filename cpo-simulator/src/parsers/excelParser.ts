export interface ParsedExcelResult {
  isValid: boolean;
  errors: string[];
}

export async function parseDiagnosticExcel(_file: File): Promise<ParsedExcelResult> {
  return {
    isValid: false,
    errors: ["Парсер Excel будет реализован в Фазе 1.2."]
  };
}
