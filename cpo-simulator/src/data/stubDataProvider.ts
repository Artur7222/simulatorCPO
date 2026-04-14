import type { DataProvider } from "./dataProvider";
import type {
  DiagnosticDataBundle,
  DiagnosticSkillRule,
  DiagnosticTask,
  DiagnosticTaskRubric
} from "../types/diagnostic";
import type { SimulatorSkillContent } from "../types/simulator";

const DIAGNOSTIC_TASKS: DiagnosticTask[] = [
  {
    id: "task-1",
    order: 1,
    skillName: "Анализ рынка и конкурентов",
    topic: "Анализ рынка и конкурентов",
    question: "Какие разделы и ответы на какие вопросы должен содержать анализ рынка?",
    guidance: "Опишите структуру исследования и выводы, опираясь на TAM/SAM/SOM, сегментацию, динамику и тренды."
  },
  {
    id: "task-2",
    order: 2,
    skillName: "Видение продукта",
    topic: "Видение продукта",
    question: "Сформулируйте видение продукта: ЦА, проблема/потребность, решение (1-2 предложения), выгода; и ценность продукта для компании.",
    guidance: "Покажите связь ЦА -> проблема -> выгода и бизнес-ценность для компании."
  },
  {
    id: "task-3",
    order: 3,
    skillName: "Бизнес-модель и монетизация",
    topic: "Бизнес модель и монетизации",
    question: "Коротко опишите основную бизнес-модель и альтернативную. Для основной предложите две модели монетизации: кто, когда и за что платит.",
    guidance: "Покажите различие между бизнес-моделью и монетизацией и применимость к кейсу."
  },
  {
    id: "task-4",
    order: 4,
    skillName: "Метрики продукта",
    topic: "Метрики продукта",
    question: "Опишите ключевые метрики продукта. Постройте декомпозицию доходной и расходной части (формула + дерево метрик).",
    guidance: "Добавьте доходные, клиентские и retention-метрики, а также измеримые формулы."
  },
  {
    id: "task-5",
    order: 5,
    skillName: "Гипотезы и приоритизация",
    topic: "Гипотезы и приоритизация",
    question: "Сформулируйте 3 гипотезы: две для одной метрики, одну для второй. Опишите приоритизацию гипотез.",
    guidance: "В гипотезе должны быть действие, целевая метрика и ожидаемый эффект."
  },
  {
    id: "task-6",
    order: 6,
    skillName: "Исследования и проверка гипотез",
    topic: "Исследования и проверка гипотез",
    question: "Опишите план проверки и дизайн экспериментов для гипотез из прошлого задания.",
    guidance: "Укажите шаги, сроки, критерии успеха/остановки и релевантные методы исследований."
  },
  {
    id: "task-7",
    order: 7,
    skillName: "Аналитика в продукте",
    topic: "Аналитика в продукте",
    question: "Рассчитайте конверсию из лида в клиента для окупаемости рекламной кампании. Кратко опишите путь расчета.",
    guidance: "Используйте только заданные числа и явно покажите формулы.",
    inputData: {
      numericFacts: [
        { name: "Бюджет кампании", value: 1400000, unit: "RUB" },
        { name: "Стоимость лида", value: 2500, unit: "RUB" },
        { name: "Первоначальный платеж", value: 65000, unit: "RUB" },
        { name: "Ежемесячный платеж", value: 13000, unit: "RUB" },
        { name: "Срок ежемесячных платежей", value: 10, unit: "months" },
        { name: "Расходы на поддержку на клиента", value: 60000, unit: "RUB" }
      ]
    }
  },
  {
    id: "task-8",
    order: 8,
    skillName: "Аналитика в продукте",
    topic: "Аналитика в продукте",
    question: "По данным за год определите, какой сегмент стоит продолжать привлекать, и какие новые вводные могут изменить решение.",
    guidance: "Сделайте сквозной расчет конверсий по сегментам и прокомментируйте ограничения данных.",
    inputData: {
      tableRows: [
        { segment: "1,2", month: "Январь", mau: 24700, leads: 346, clients: 59 },
        { segment: "1,2", month: "Февраль", mau: 23200, leads: 394, clients: 87 },
        { segment: "1,2", month: "Март", mau: 21000, leads: 399, clients: 104 },
        { segment: "1,2,3", month: "Апрель", mau: 19100, leads: 420, clients: 139 },
        { segment: "3,4", month: "Май", mau: 55500, leads: 444, clients: 58 },
        { segment: "3,4", month: "Июнь", mau: 66500, leads: 399, clients: 44 },
        { segment: "1", month: "Июль", mau: 15900, leads: 223, clients: 29 },
        { segment: "2", month: "Август", mau: 15500, leads: 620, clients: 161 },
        { segment: "3", month: "Сентябрь", mau: 15700, leads: 864, clients: 259 },
        { segment: "1,3", month: "Октябрь", mau: 42000, leads: 1890, clients: 473 },
        { segment: "3,4", month: "Ноябрь", mau: 75000, leads: 1650, clients: 363 },
        { segment: "2,3", month: "Декабрь", mau: 26100, leads: 1305, clients: 431 }
      ]
    }
  }
];

const DIAGNOSTIC_TASK_RUBRICS: DiagnosticTaskRubric[] = [
  {
    taskId: "task-1",
    criteria: [
      { id: "market-structure", title: "Полнота анализа рынка", weight: 0.5, evidenceKeywords: ["tam", "sam", "som", "динам", "сегмент", "тренд"], minKeywordHits: 3, failSignals: ["без данных", "не знаю"] },
      { id: "competitor-structure", title: "Полнота анализа конкурентов", weight: 0.5, evidenceKeywords: ["конкурент", "доля", "прям", "непрям", "вывод"], minKeywordHits: 3, failSignals: ["нет конкурентов"] }
    ]
  },
  {
    taskId: "task-2",
    criteria: [
      { id: "segments", title: "Сегментация и портрет ЦА", weight: 0.35, evidenceKeywords: ["сегмент", "ца", "портрет", "аудитория"], minKeywordHits: 2 },
      { id: "problem-solution-benefit", title: "Связка проблема-решение-выгода", weight: 0.4, evidenceKeywords: ["проблем", "решени", "выгод", "ценност"], minKeywordHits: 3 },
      { id: "company-value", title: "Ценность для бизнеса компании", weight: 0.25, evidenceKeywords: ["выруч", "рост", "ltv", "доля рынка", "прибыл"], minKeywordHits: 1 }
    ]
  },
  {
    taskId: "task-3",
    criteria: [
      { id: "bm-mm-difference", title: "Разница БМ и ММ", weight: 0.3, evidenceKeywords: ["бизнес-модель", "монетизац", "кто платит", "когда платит"], minKeywordHits: 2 },
      { id: "model-coverage", title: "Полнота предложенных моделей", weight: 0.4, evidenceKeywords: ["основн", "альтернатив", "подписк", "разовый", "рассрочка"], minKeywordHits: 3 },
      { id: "case-fit", title: "Применимость к кейсу", weight: 0.3, evidenceKeywords: ["образован", "продукт", "платформа", "клиент"], minKeywordHits: 2 }
    ]
  },
  {
    taskId: "task-4",
    criteria: [
      { id: "core-metrics", title: "Набор ключевых метрик", weight: 0.4, evidenceKeywords: ["выруч", "клиент", "удерж", "отток", "конвер"], minKeywordHits: 3 },
      { id: "formulae", title: "Формулы доходов и расходов", weight: 0.35, evidenceKeywords: ["формул", "доход", "расход", "=", "маржин"], minKeywordHits: 3 },
      { id: "decomposition", title: "Декомпозиция метрик", weight: 0.25, evidenceKeywords: ["дерево", "уров", "декомпоз", "nsm"], minKeywordHits: 1 }
    ]
  },
  {
    taskId: "task-5",
    criteria: [
      { id: "hypothesis-format", title: "Формат гипотез", weight: 0.45, evidenceKeywords: ["гипотез", "если", "то", "метрик", "эффект"], minKeywordHits: 3, failSignals: ["сделать", "реализовать просто"] },
      { id: "prioritization-method", title: "Метод приоритизации", weight: 0.35, evidenceKeywords: ["rice", "ice", "приорит", "impact", "effort"], minKeywordHits: 2 },
      { id: "math-rationale", title: "Численное обоснование", weight: 0.2, evidenceKeywords: ["прогноз", "расчет", "%", "база"], minKeywordHits: 1 }
    ]
  },
  {
    taskId: "task-6",
    criteria: [
      { id: "research-choice", title: "Выбор методов проверки", weight: 0.35, evidenceKeywords: ["интервью", "опрос", "ab", "пилот", "историческ"], minKeywordHits: 2 },
      { id: "experiment-design", title: "Дизайн эксперимента", weight: 0.45, evidenceKeywords: ["шаг", "срок", "критер", "завершен", "услов"], minKeywordHits: 3 },
      { id: "verification-logic", title: "Проверка именно гипотез", weight: 0.2, evidenceKeywords: ["провер", "предполож", "валидац"], minKeywordHits: 1 }
    ]
  },
  {
    taskId: "task-7",
    criteria: [
      { id: "unit-economics", title: "Корректный юнит-экономический расчет", weight: 0.55, evidenceKeywords: ["конвер", "окуп", "лид", "клиент", "доход"], minKeywordHits: 3 },
      { id: "formula-transparency", title: "Прозрачность формул и шагов", weight: 0.45, evidenceKeywords: ["формул", "расчет", "руб", "=", "%"], minKeywordHits: 2 }
    ]
  },
  {
    taskId: "task-8",
    criteria: [
      { id: "funnel-calculation", title: "Сквозной расчет воронки", weight: 0.45, evidenceKeywords: ["mau", "заяв", "клиент", "конвер", "воронк"], minKeywordHits: 3 },
      { id: "segment-choice", title: "Выбор сегмента на основе данных", weight: 0.35, evidenceKeywords: ["сегмент", "привлекать", "лучше", "эффектив"], minKeywordHits: 2 },
      { id: "new-factors", title: "Новые вводные и ограничения", weight: 0.2, evidenceKeywords: ["дополн", "вводн", "сезон", "канал", "качество лида"], minKeywordHits: 1 }
    ]
  }
];

const DIAGNOSTIC_SKILL_RULES: DiagnosticSkillRule[] = [
  { skillName: "Анализ рынка и конкурентов", maxScore: 6, weight: 0.16, rubricSummary: "Структура рыночного и конкурентного анализа, осмысленные выводы." },
  { skillName: "Видение продукта", maxScore: 6, weight: 0.16, rubricSummary: "Связность ЦА, проблемы, решения, выгоды и ценности для компании." },
  { skillName: "Бизнес-модель и монетизация", maxScore: 6, weight: 0.12, rubricSummary: "Различение моделей и практическая применимость к кейсу." },
  { skillName: "Метрики продукта", maxScore: 6, weight: 0.14, rubricSummary: "Выбор измеримых метрик и корректная декомпозиция формул." },
  { skillName: "Гипотезы и приоритизация", maxScore: 6, weight: 0.14, rubricSummary: "Проверяемость гипотез и обоснованная приоритизация." },
  { skillName: "Исследования и проверка гипотез", maxScore: 6, weight: 0.12, rubricSummary: "Релевантные исследования и качественный дизайн экспериментов." },
  { skillName: "Аналитика в продукте", maxScore: 6, weight: 0.16, rubricSummary: "Корректные расчеты и интерпретация метрик по сегментам." }
];

const DIAGNOSTIC_BUNDLE: DiagnosticDataBundle = {
  meta: {
    schemaVersion: "2.0.0",
    sourceDescription: "Нормализовано по файлам 'Описание кейса и задания - итог.docx' и 'Основные критерии для оценки.xlsx'",
    generatedAtIso: "2026-04-14T00:00:00.000Z"
  },
  introText:
    "Вам предстоит пройти диагностику продуктовых навыков в формате связанного кейса CPO: от анализа рынка до продуктовой аналитики.",
  caseDescription:
    "Вы заняли позицию CPO в крупной технологической компании. Компания выходит на рынок онлайн-образования и запускает продукт по специальности 'Менеджер продукта в IT-компании'. Ваша задача - пройти путь от анализа рынка и формулировки видения до гипотез, экспериментов и расчетов продуктовой аналитики.",
  tasks: DIAGNOSTIC_TASKS,
  taskRubrics: DIAGNOSTIC_TASK_RUBRICS,
  skillRules: DIAGNOSTIC_SKILL_RULES
};

const SIMULATOR_SKILLS: SimulatorSkillContent[] = [
  {
    skillId: "market-analysis",
    title: "Анализ рынка",
    description: "Определение целевых сегментов, сигналов спроса и рисков.",
    blocks: [
      {
        id: "market-theory",
        type: "theory",
        title: "Теория",
        content: "Анализ рынка начинается с сегментов, спроса и конкурентного давления."
      },
      {
        id: "market-case",
        type: "case-description",
        title: "Кейс",
        content: "Продукт теряет новых пользователей на первой неделе после регистрации."
      },
      {
        id: "market-choice-1",
        type: "choice-question",
        title: "Проверка гипотезы",
        question: "Какой шаг стоит сделать первым?",
        options: [
          "Сравнить удержание по сегментам и каналам привлечения",
          "Сразу запускать новую рекламную кампанию",
          "Полностью переписать onboarding без анализа"
        ],
        correctOptionIndex: 0
      },
      {
        id: "market-open-1",
        type: "open-question",
        title: "Открытый вопрос",
        question: "Опишите, как вы приоритизируете сегменты для первой итерации.",
        minLength: 30
      },
      {
        id: "market-feedback",
        type: "feedback",
        title: "Обратная связь",
        content: "Сфокусируйтесь на сегментах с максимальным влиянием на ключевую метрику."
      }
    ]
  },
  {
    skillId: "product-metrics",
    title: "Метрики продукта",
    description: "Выбор ключевых и guardrail-метрик для решений.",
    blocks: [
      {
        id: "metrics-theory",
        type: "theory",
        title: "Теория",
        content: "Метрики должны связывать бизнес-цель с поведением пользователя."
      },
      {
        id: "metrics-choice-1",
        type: "choice-question",
        title: "Выбор метрики",
        question: "Что лучше отражает прогресс активации?",
        options: [
          "Доля пользователей, сделавших первое ценное действие",
          "Количество просмотров маркетинговой страницы",
          "Общее время в приложении без сегментации"
        ],
        correctOptionIndex: 0
      },
      {
        id: "metrics-open-1",
        type: "open-question",
        title: "Открытый вопрос",
        question: "Какую guardrail-метрику вы добавите и почему?",
        minLength: 30
      },
      {
        id: "metrics-feedback",
        type: "feedback",
        title: "Обратная связь",
        content: "Проверяйте, что рост ключевой метрики не ухудшает пользовательский опыт."
      }
    ]
  },
  {
    skillId: "hypotheses",
    title: "Гипотезы",
    description: "Формулировка проверяемых гипотез и критериев успеха.",
    blocks: [
      {
        id: "hyp-theory",
        type: "theory",
        title: "Теория",
        content: "Сильная гипотеза описывает изменение, сегмент, ожидаемый эффект и срок проверки."
      },
      {
        id: "hyp-case",
        type: "case-description",
        title: "Кейс",
        content: "В онбординге падает конверсия между вторым и третьим шагом."
      },
      {
        id: "hyp-choice-1",
        type: "choice-question",
        title: "Выбор гипотезы",
        question: "Какую гипотезу стоит проверить первой?",
        options: [
          "Сократить число шагов онбординга",
          "Добавить больше подсказок на каждом экране",
          "Расширить форму профиля дополнительными полями"
        ],
        correctOptionIndex: 0
      },
      {
        id: "hyp-open-1",
        type: "open-question",
        title: "Открытый вопрос",
        question: "Опишите критерии успеха эксперимента по выбранной гипотезе.",
        minLength: 30
      },
      {
        id: "hyp-feedback",
        type: "feedback",
        title: "Обратная связь",
        content: "Гипотеза сильнее, когда явно указаны критерии успеха и временное окно проверки."
      }
    ]
  }
];

export class StubDataProvider implements DataProvider {
  private diagnosticBundle: DiagnosticDataBundle | null = null;
  private simulatorSkills: SimulatorSkillContent[] = [];

  async loadDiagnosticSources(_excelFile: File, _wordFile: File): Promise<void> {
    this.diagnosticBundle = DIAGNOSTIC_BUNDLE;
  }

  getDiagnosticBundle(): DiagnosticDataBundle | null {
    return this.diagnosticBundle;
  }

  async loadSimulatorSource(_wordFile: File): Promise<void> {
    this.simulatorSkills = SIMULATOR_SKILLS;
  }

  getSimulatorSkills(): SimulatorSkillContent[] {
    return this.simulatorSkills;
  }
}
