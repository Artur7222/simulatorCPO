export interface ParsedWordResult {
  isValid: boolean;
  errors: string[];
}

export async function parseWordDocument(_file: File): Promise<ParsedWordResult> {
  return {
    isValid: false,
    errors: ["Парсер Word будет реализован в Фазах 1.3 и 2.2."]
  };
}
