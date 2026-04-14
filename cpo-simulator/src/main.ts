import "./styles.css";
import { goToDiagnosticStep, goToSimulatorStep, goToTopLevelScreen } from "./router/screenRouter";
import { StubDataProvider } from "./data/stubDataProvider";
import { evaluateDiagnosticAnswers } from "./services/diagnosticEvaluator";
import {
  getAppState,
  setCurrentDiagnosticTaskIndex,
  setCurrentSkillId,
  resetDiagnosticRun,
  setDiagnosticDataBundle,
  setDiagnosticDataReady,
  setDiagnosticExcelFileName,
  setDiagnosticExcelUpload,
  setDiagnosticRecommendations,
  setDiagnosticResults,
  setDiagnosticSummary,
  setDiagnosticUploadError,
  setDiagnosticWordFileName,
  setDiagnosticWordUpload,
  setSelectedSkillIds,
  setSimulatorDataReady,
  setSimulatorSkillProgress,
  setSimulatorSkills,
  setSimulatorWordUpload,
  subscribeToAppState,
  upsertDiagnosticAnswer,
  upsertSimulatorAnswer,
  upsertSimulatorResult
} from "./state/appState";
import type { AppState, DiagnosticStepId, SimulatorStepId, TopLevelScreenId, UploadState } from "./types/app";
import type { DiagnosticTask } from "./types/diagnostic";
import type { SimulatorBlock, SimulatorSkillContent } from "./types/simulator";
import { evaluateSimulatorSkill } from "./services/simulatorEvaluator";
import { hasMinLength } from "./utils/validation";

const app = document.querySelector<HTMLDivElement>("#app");
const dataProvider = new StubDataProvider();
let diagnosticExcelFile: File | null = null;
let diagnosticWordFile: File | null = null;
let processingTimerId: number | null = null;
let processingTimeoutId: number | null = null;

if (!app) {
  throw new Error("Не найден корневой элемент приложения.");
}

app.innerHTML = `
<div class="app">
  <section class="layout">
    <aside class="sidebar">
      <div class="side-head">Навигация по сценарию</div>
      <div class="tabs">
        <button class="tab active" data-screen="diagnostic">
          <strong>Диагностика продуктовых навыков</strong>
          <span>Вступление, задание, анализ, результаты</span>
        </button>
        <button class="tab" data-screen="simulator">
          <strong>Симулятор продуктовых навыков</strong>
          <span>Навыки, прохождение, итог</span>
        </button>
      </div>
    </aside>
    <main class="device">
      <div class="device-inner">
        <div class="ui-top">
          <div>
            <div class="ui-title" id="screenTitle">Диагностика продуктовых навыков</div>
            <div class="ui-sub" id="screenSubtitle">Загрузите материалы и пройдите оценку навыков</div>
          </div>
          <div class="badge" id="screenBadge">Раздел 1</div>
        </div>
        <div class="ui-body">
          <section class="screen active" id="screen-diagnostic">
            <div class="section-header">
              <h3>Диагностика продуктовых навыков</h3>
              <div class="stepper">
                <button class="step-btn active" data-diag-step="intro">Вступление</button>
                <button class="step-btn" data-diag-step="task">Задание</button>
                <button class="step-btn" data-diag-step="processing">Анализ</button>
                <button class="step-btn" data-diag-step="results">Результаты</button>
              </div>
            </div>
            <div class="demo-stage">
              <div class="split" data-diag-view="intro">
                <div class="panel">
                  <div class="section-title">
                    <h3>Вступление в диагностику</h3>
                    <span class="chip purple" id="diagTaskCountChip">8 заданий</span>
                  </div>
                  <div class="block subtle section-gap-top">
                    <h3>Описание кейса</h3>
                    <p id="diagnosticCaseText">Описание кейса появится после загрузки исходных материалов диагностики.</p>
                  </div>
                  <div class="footer-actions section-gap-top">
                    <button class="button primary" id="startDiagnosticBtn" data-diag-next="task">Начать диагностику</button>
                  </div>
                </div>
                <div class="card result-highlight">
                  <h3>Формат прохождения</h3>
                  <p>8 последовательных заданий, сохранение ответов и переход к результатам после завершения анализа.</p>
                </div>
              </div>
              <div class="panel" data-diag-view="task" hidden>
                <div class="section-title">
                  <h3 id="diagTaskTitle">Задание 1 из 8</h3>
                  <span class="chip" id="diagTaskSkill">Навык</span>
                </div>
                <div class="progress section-gap-top"><span id="diagTaskProgress" class="progress-15"></span></div>
                <div class="block subtle section-gap-top">
                  <h3 id="diagTaskQuestion">Вопрос</h3>
                  <p id="diagTaskGuidance">Уточнение к вопросу</p>
                </div>
                <div class="block section-gap-top" id="diagTaskDataset" hidden></div>
                <div class="field section-gap-top">
                  <label>Ответ</label>
                  <textarea class="textarea" id="diagTaskAnswer" placeholder="Введите ответ на вопрос"></textarea>
                </div>
                <div class="meta">
                  <span>Минимум 50 символов</span>
                  <span id="diagTaskCounter">0 символов</span>
                </div>
                <p class="upload-error section-gap-sm" id="diagTaskError" hidden></p>
                <div class="footer-actions section-gap-top">
                  <button class="button ghost" id="diagTaskBackBtn">Назад</button>
                  <button class="button primary" id="diagTaskNextBtn">Далее</button>
                </div>
              </div>
              <div class="panel result-highlight" data-diag-view="processing" hidden>
                <div class="section-title">
                  <h3>Анализ ответов</h3>
                  <span class="chip purple">AI-ready</span>
                </div>
                <p>Оцениваем ответы, формируем комментарии и рекомендации по навыкам.</p>
                <div class="progress section-gap-top"><span id="processingBar" class="progress-15"></span></div>
                <p class="section-gap-top">Пожалуйста, подождите 3-5 секунд.</p>
              </div>
              <div data-diag-view="results" hidden>
                <div class="row-3" id="diagResultsGrid"></div>
                <div class="row section-gap-top">
                  <div class="panel">
                    <h3>Комментарии</h3>
                    <p id="diagSummaryText">Итоги диагностики появятся после завершения анализа.</p>
                  </div>
                  <div class="panel">
                    <h3>Рекомендации 1-3 (приоритет)</h3>
                    <div class="chips section-gap-top" id="diagRecommendationsPrimary"></div>
                    <h3 class="section-gap-top">Рекомендации 4-6 (дополнительно)</h3>
                    <div class="chips section-gap-top" id="diagRecommendationsSecondary"></div>
                    <div class="section-gap-top" id="diagSkillSelectors"></div>
                    <div class="footer-actions section-gap-top">
                      <button class="button ghost" id="diagResultsBackBtn">Назад</button>
                      <button class="button primary" id="toSimulator">Перейти в симулятор</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="upload-zone" hidden>
                <div class="row">
                  <div class="upload" id="excelZone">
                    <div class="section-title">
                      <h3>Excel с критериями</h3>
                      <span class="status wait" id="excelStatus">Ожидает</span>
                    </div>
                    <p id="excelText">Файл не выбран</p>
                    <button class="button secondary" id="excelBtn">Загрузить файл</button>
                    <input class="hidden-input" id="excelInput" type="file" accept=".xlsx,.xls" />
                  </div>
                  <div class="upload" id="wordZone">
                    <div class="section-title">
                      <h3>Word с кейсом и заданиями</h3>
                      <span class="status wait" id="wordStatus">Ожидает</span>
                    </div>
                    <p id="wordText">Файл не выбран</p>
                    <button class="button secondary" id="wordBtn">Загрузить файл</button>
                  <input class="hidden-input" id="wordInput" type="file" accept=".doc,.docx" />
                  </div>
                </div>
                <p class="upload-error" id="diagnosticUploadError" hidden></p>
              </div>
            </div>
          </section>
          <section class="screen" id="screen-simulator">
            <div class="section-header">
              <h3>Симулятор продуктовых навыков</h3>
              <div class="stepper">
                <button class="step-btn active" data-sim-step="skills">Навыки</button>
                <button class="step-btn" data-sim-step="session">Прохождение</button>
                <button class="step-btn" data-sim-step="results">Итог</button>
              </div>
            </div>
            <div class="demo-stage">
              <div class="panel" data-sim-view="skills">
                <div class="section-title">
                  <h3>Доступные навыки</h3>
                  <span class="chip purple">Рекомендации из диагностики</span>
                </div>
                <div class="skill-grid section-gap-top" id="simSkillsGrid"></div>
              </div>
              <div class="panel" data-sim-view="session" hidden>
                <div class="section-title">
                  <h3 id="simSessionTitle">Прохождение навыка</h3>
                  <span class="chip" id="simSessionStep">Шаг 1</span>
                </div>
                <div class="progress section-gap-top"><span id="simSessionProgress" class="progress-15"></span></div>
                <div class="stack section-gap-top" id="simSessionContent"></div>
                <p class="upload-error section-gap-sm" id="simSessionError" hidden></p>
                <div class="footer-actions section-gap-top">
                  <button class="button ghost" id="simSessionBackBtn">Назад</button>
                  <button class="button primary" id="simSessionNextBtn">Далее</button>
                </div>
              </div>
              <div data-sim-view="results" hidden>
                <div class="row">
                  <div class="result result-highlight stack-tight">
                    <h3>Итог по навыку</h3>
                    <div class="score" id="simResultScore">0%</div>
                    <p>по закрытым вопросам</p>
                  </div>
                  <div class="result stack-tight">
                    <h3>Статус открытых ответов</h3>
                    <p id="simResultOpenStatus">Результат появится после завершения навыка.</p>
                  </div>
                </div>
                <div class="footer-actions section-gap-top">
                  <button class="button ghost" id="simResultBackBtn">Назад</button>
                  <button class="button primary" id="simResultToSkillsBtn">К навыкам</button>
                </div>
              </div>
              <div class="upload-zone">
                <div class="upload" id="simZone">
                  <div class="section-title">
                    <h3>Word с контентом симулятора</h3>
                    <span class="status wait" id="simStatus">Ожидает</span>
                  </div>
                  <p id="simText">Файл не выбран</p>
                  <button class="button secondary" id="simBtn">Загрузить файл</button>
                  <input class="hidden-input" id="simInput" type="file" accept=".doc,.docx" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </section>
</div>
`;

const screenMeta: Record<TopLevelScreenId, { title: string; subtitle: string; badge: string }> = {
  diagnostic: {
    title: "Диагностика продуктовых навыков",
    subtitle: "Загрузите материалы и пройдите оценку навыков",
    badge: "Раздел 1"
  },
  simulator: {
    title: "Симулятор продуктовых навыков",
    subtitle: "Развивайте навыки через теорию, кейсы и практику",
    badge: "Раздел 2"
  }
};

function showTopScreen(id: TopLevelScreenId): void {
  const title = document.querySelector<HTMLElement>("#screenTitle");
  const subtitle = document.querySelector<HTMLElement>("#screenSubtitle");
  const badge = document.querySelector<HTMLElement>("#screenBadge");
  const topTabs = [...document.querySelectorAll<HTMLButtonElement>(".tab")];
  const topScreens = [...document.querySelectorAll<HTMLElement>(".screen")];
  const meta = screenMeta[id];

  topTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.screen === id));
  topScreens.forEach((screen) => screen.classList.toggle("active", screen.id === `screen-${id}`));

  if (title) title.textContent = meta.title;
  if (subtitle) subtitle.textContent = meta.subtitle;
  if (badge) badge.textContent = meta.badge;
}

function bindStepGroup(
  stepSelector: string,
  viewSelector: string,
  stepDataKey: "diagStep" | "simStep",
  viewDataKey: "diagView" | "simView"
): (id: DiagnosticStepId | SimulatorStepId) => void {
  const stepButtons = [...document.querySelectorAll<HTMLButtonElement>(stepSelector)];
  const views = [...document.querySelectorAll<HTMLElement>(viewSelector)];

  const activate = (id: DiagnosticStepId | SimulatorStepId): void => {
    stepButtons.forEach((button) =>
      button.classList.toggle("active", button.dataset[stepDataKey] === id)
    );
    views.forEach((view) => {
      view.hidden = view.dataset[viewDataKey] !== id;
    });
  };

  return activate;
}

const showDiagStep = bindStepGroup(
  "[data-diag-step]",
  "[data-diag-view]",
  "diagStep",
  "diagView"
);
const showSimStep = bindStepGroup(
  "[data-sim-step]",
  "[data-sim-view]",
  "simStep",
  "simView"
);

function clearProcessingTimer(): void {
  if (processingTimerId === null) return;
  window.clearInterval(processingTimerId);
  processingTimerId = null;
  if (processingTimeoutId !== null) {
    window.clearTimeout(processingTimeoutId);
    processingTimeoutId = null;
  }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
    reader.readAsArrayBuffer(file);
  });
}

function validateFileKind(kind: UploadConfig["kind"], fileName: string): string | null {
  const lowerName = fileName.toLowerCase();
  if (kind === "diagnostic-excel" && !/\.xlsx?$/.test(lowerName)) {
    return "Для критериев диагностики нужен файл Excel (.xlsx или .xls).";
  }
  if ((kind === "diagnostic-word" || kind === "simulator-word") && !/\.docx?$/.test(lowerName)) {
    return "Нужен файл Word в формате .doc или .docx.";
  }
  return null;
}

async function preloadDiagnosticBundle(): Promise<void> {
  try {
    const placeholderExcel = new File([""], "criteria.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const placeholderWord = new File([""], "case.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    await dataProvider.loadDiagnosticSources(placeholderExcel, placeholderWord);
    const bundle = dataProvider.getDiagnosticBundle();
    if (!bundle) return;
    setDiagnosticDataBundle(bundle);
    setDiagnosticDataReady(true);
    setDiagnosticUploadError(null);
  } catch (_error) {
    setDiagnosticDataReady(false);
    setDiagnosticUploadError("Не удалось подготовить задания диагностики.");
  }
}

document.querySelectorAll<HTMLButtonElement>("[data-diag-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStep = button.dataset.diagStep as DiagnosticStepId | undefined;
    if (!nextStep) return;
    const state = getAppState();
    const canStartDiagnostic = state.diagnosticDataReady;
    if (nextStep === "task" && !canStartDiagnostic) {
      setDiagnosticUploadError("Перед стартом загрузите Excel с критериями и Word с кейсом.");
      return;
    }
    if (nextStep === "results" && getAppState().diagnosticResults.length === 0) return;
    goToDiagnosticStep(nextStep);
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-sim-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStep = button.dataset.simStep as SimulatorStepId | undefined;
    if (!nextStep) return;
    goToSimulatorStep(nextStep);
  });
});

document.querySelectorAll<HTMLButtonElement>(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.screen as TopLevelScreenId | undefined;
    if (!target) return;
    goToTopLevelScreen(target);
    showTopScreen(target);
  });
});

document.querySelector<HTMLButtonElement>("#toSimulator")?.addEventListener("click", () => {
  goToTopLevelScreen("simulator");
  goToSimulatorStep("skills");
});

document.querySelector<HTMLButtonElement>("#startDiagnosticBtn")?.addEventListener("click", () => {
  const state = getAppState();
  if (!state.diagnosticDataReady) {
    setDiagnosticUploadError("Перед стартом загрузите Excel с критериями и Word с кейсом.");
    return;
  }
  resetDiagnosticRun();
  goToDiagnosticStep("task");
});

document.querySelector<HTMLButtonElement>("#diagTaskBackBtn")?.addEventListener("click", () => {
  const state = getAppState();
  if (state.currentDiagnosticTaskIndex <= 0) {
    goToDiagnosticStep("intro");
    return;
  }
  setCurrentDiagnosticTaskIndex(state.currentDiagnosticTaskIndex - 1);
});

document.querySelector<HTMLButtonElement>("#diagTaskNextBtn")?.addEventListener("click", () => {
  const state = getAppState();
  const bundle = state.diagnosticDataBundle;
  if (!bundle) return;
  const task = bundle.tasks[state.currentDiagnosticTaskIndex];
  if (!task) return;
  const answerEl = document.querySelector<HTMLTextAreaElement>("#diagTaskAnswer");
  const errorEl = document.querySelector<HTMLElement>("#diagTaskError");
  const answerText = answerEl?.value ?? "";
  if (!hasMinLength(answerText, 50)) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = "Ответ должен содержать минимум 50 символов.";
    }
    return;
  }
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
  upsertDiagnosticAnswer({
    taskId: task.id,
    text: answerText.trim(),
    updatedAt: new Date().toISOString()
  });
  if (state.currentDiagnosticTaskIndex < bundle.tasks.length - 1) {
    setCurrentDiagnosticTaskIndex(state.currentDiagnosticTaskIndex + 1);
    return;
  }
  goToDiagnosticStep("processing");
});

document.querySelector<HTMLButtonElement>("#diagResultsBackBtn")?.addEventListener("click", () => {
  goToDiagnosticStep("task");
});

function getCurrentSimulatorSkill(state: AppState): SimulatorSkillContent | null {
  if (!state.currentSkillId) return null;
  return state.simulatorSkills.find((item) => item.skillId === state.currentSkillId) ?? null;
}

function getCurrentSimulatorBlock(state: AppState): SimulatorBlock | null {
  const skill = getCurrentSimulatorSkill(state);
  if (!skill) return null;
  const index = state.simulatorProgress[skill.skillId] ?? 0;
  return skill.blocks[index] ?? null;
}

document.querySelector<HTMLButtonElement>("#simSessionBackBtn")?.addEventListener("click", () => {
  const state = getAppState();
  const skill = getCurrentSimulatorSkill(state);
  if (!skill) {
    goToSimulatorStep("skills");
    return;
  }
  const progress = state.simulatorProgress[skill.skillId] ?? 0;
  if (progress <= 0) {
    goToSimulatorStep("skills");
    return;
  }
  setSimulatorSkillProgress(skill.skillId, progress - 1);
});

document.querySelector<HTMLButtonElement>("#simSessionNextBtn")?.addEventListener("click", () => {
  const state = getAppState();
  const skill = getCurrentSimulatorSkill(state);
  const block = getCurrentSimulatorBlock(state);
  const errorEl = document.querySelector<HTMLElement>("#simSessionError");
  // #region agent log
  fetch("http://127.0.0.1:7854/ingest/7b2bbf2f-6bb1-469b-b244-a4ab47e9589e",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"02da9d"},body:JSON.stringify({sessionId:"02da9d",runId:"initial",hypothesisId:"H1",location:"src/main.ts:simSessionNext:entry",message:"Simulator next clicked",data:{hasSkill:Boolean(skill),blockType:block?.type ?? null,skillId:skill?.skillId ?? null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!skill || !block) return;
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
  if (block.type === "choice-question") {
    const selected = document.querySelector<HTMLInputElement>(`input[name="sim-choice-${block.id}"]:checked`);
    if (!selected) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = "Выберите один вариант ответа.";
      }
      return;
    }
    upsertSimulatorAnswer({ skillId: skill.skillId, blockId: block.id, value: selected.value });
  }
  if (block.type === "open-question") {
    const textarea = document.querySelector<HTMLTextAreaElement>(`#sim-open-${block.id}`);
    const value = textarea?.value ?? "";
    // #region agent log
    fetch("http://127.0.0.1:7854/ingest/7b2bbf2f-6bb1-469b-b244-a4ab47e9589e",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"02da9d"},body:JSON.stringify({sessionId:"02da9d",runId:"initial",hypothesisId:"H2",location:"src/main.ts:simSessionNext:openValidation",message:"Validating open question answer",data:{blockId:block.id,minLength:block.minLength,inputLength:value.trim().length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!hasMinLength(value, block.minLength)) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = `Для открытого ответа нужно минимум ${block.minLength} символов.`;
      }
      return;
    }
    upsertSimulatorAnswer({ skillId: skill.skillId, blockId: block.id, value: value.trim() });
  }
  const progress = state.simulatorProgress[skill.skillId] ?? 0;
  if (progress >= skill.blocks.length - 1) {
    const answers = state.simulatorAnswers.filter((item) => item.skillId === skill.skillId);
    const evaluation = evaluateSimulatorSkill({ skill, answers });
    // #region agent log
    fetch("http://127.0.0.1:7854/ingest/7b2bbf2f-6bb1-469b-b244-a4ab47e9589e",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"02da9d"},body:JSON.stringify({sessionId:"02da9d",runId:"initial",hypothesisId:"H3",location:"src/main.ts:simSessionNext:finalize",message:"Finalizing skill result",data:{skillId:skill.skillId,progress,blocksTotal:skill.blocks.length,percentage:evaluation.percentage},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    upsertSimulatorResult({
      skillId: skill.skillId,
      percentage: evaluation.percentage,
      completedBlocks: evaluation.completedBlocks,
      totalBlocks: evaluation.totalBlocks
    });
    setSimulatorSkillProgress(skill.skillId, skill.blocks.length);
    goToSimulatorStep("results");
    return;
  }
  setSimulatorSkillProgress(skill.skillId, progress + 1);
});

document.querySelector<HTMLButtonElement>("#simResultBackBtn")?.addEventListener("click", () => {
  goToSimulatorStep("session");
});

document.querySelector<HTMLButtonElement>("#simResultToSkillsBtn")?.addEventListener("click", () => {
  goToSimulatorStep("skills");
});

type UploadConfig = {
  kind: "diagnostic-excel" | "diagnostic-word" | "simulator-word";
  buttonId: string;
  inputId: string;
  zoneId: string;
  textId: string;
  statusId: string;
};

function setUploadState(kind: UploadConfig["kind"], upload: UploadState): void {
  if (kind === "diagnostic-excel") setDiagnosticExcelUpload(upload);
  if (kind === "diagnostic-word") setDiagnosticWordUpload(upload);
  if (kind === "simulator-word") setSimulatorWordUpload(upload);
}

function applyUploadStateToDom(config: UploadConfig, upload: UploadState): void {
  const zone = document.getElementById(config.zoneId);
  const text = document.getElementById(config.textId);
  const status = document.getElementById(config.statusId);
  if (!zone || !text || !status) return;
  zone.classList.toggle("good", upload.status === "success");
  if (upload.status === "success") {
    text.textContent = `${upload.fileName ?? "Файл"} (${upload.fileSize ?? 0} байт)`;
    status.textContent = "Загружен";
    status.className = "status ok";
    return;
  }
  if (upload.status === "loading") {
    text.textContent = upload.fileName ?? "Чтение файла...";
    status.textContent = "Чтение";
    status.className = "status wait";
    return;
  }
  text.textContent = upload.error ?? "Файл не выбран";
  status.textContent = "Ожидает";
  status.className = "status wait";
}

function wireUpload(config: UploadConfig): void {
  const button = document.getElementById(config.buttonId);
  const input = document.getElementById(config.inputId) as HTMLInputElement | null;
  const zone = document.getElementById(config.zoneId);
  const text = document.getElementById(config.textId);
  const status = document.getElementById(config.statusId);

  if (!button || !input || !zone || !text || !status) return;

  button.addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    // #region agent log
    fetch("http://127.0.0.1:7854/ingest/7b2bbf2f-6bb1-469b-b244-a4ab47e9589e",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"02da9d"},body:JSON.stringify({sessionId:"02da9d",runId:"initial",hypothesisId:"H4",location:"src/main.ts:wireUpload:fileSelected",message:"File selected for upload",data:{kind:config.kind,fileName:file.name,fileSize:file.size},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const validationError = validateFileKind(config.kind, file.name);
    if (validationError) {
      if (config.kind !== "simulator-word") {
        setDiagnosticUploadError(validationError);
      }
      return;
    }
    if (file.size === 0) {
      if (config.kind !== "simulator-word") {
        setDiagnosticUploadError("Файл пустой. Выберите непустой файл.");
      }
      return;
    }
    const loadingState: UploadState = {
      fileName: file.name,
      fileSize: file.size,
      status: "loading",
      error: null
    };
    setUploadState(config.kind, loadingState);
    try {
      await readFileAsArrayBuffer(file);
      const successState: UploadState = {
        fileName: file.name,
        fileSize: file.size,
        status: "success",
        error: null
      };
      if (config.kind === "diagnostic-excel") {
        diagnosticExcelFile = file;
        setDiagnosticExcelFileName(file.name);
        setDiagnosticExcelUpload(successState);
      }
      if (config.kind === "diagnostic-word") {
        diagnosticWordFile = file;
        setDiagnosticWordFileName(file.name);
        setDiagnosticWordUpload(successState);
      }
      if (config.kind === "simulator-word") {
        setSimulatorWordUpload(successState);
        await dataProvider.loadSimulatorSource(file);
        setSimulatorSkills(dataProvider.getSimulatorSkills());
        setSimulatorDataReady(true);
      }
      if (config.kind === "diagnostic-excel" || config.kind === "diagnostic-word") {
        setDiagnosticUploadError(null);
        if (diagnosticExcelFile && diagnosticWordFile) {
          await dataProvider.loadDiagnosticSources(diagnosticExcelFile, diagnosticWordFile);
          const bundle = dataProvider.getDiagnosticBundle();
          // #region agent log
          fetch("http://127.0.0.1:7854/ingest/7b2bbf2f-6bb1-469b-b244-a4ab47e9589e",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"02da9d"},body:JSON.stringify({sessionId:"02da9d",runId:"initial",hypothesisId:"H5",location:"src/main.ts:wireUpload:diagnosticReady",message:"Diagnostic sources loaded",data:{hasBundle:Boolean(bundle),tasksCount:bundle?.tasks.length ?? 0},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          setDiagnosticDataBundle(bundle);
          setDiagnosticDataReady(Boolean(bundle));
        }
      }
    } catch (_error) {
      const errorState: UploadState = {
        fileName: file.name,
        fileSize: file.size,
        status: "error",
        error: "Не удалось прочитать файл."
      };
      setUploadState(config.kind, errorState);
    }
  });
}

const uploadConfigs: UploadConfig[] = [
  {
    kind: "diagnostic-excel",
    buttonId: "excelBtn",
    inputId: "excelInput",
    zoneId: "excelZone",
    textId: "excelText",
    statusId: "excelStatus"
  },
  {
    kind: "diagnostic-word",
    buttonId: "wordBtn",
    inputId: "wordInput",
    zoneId: "wordZone",
    textId: "wordText",
    statusId: "wordStatus"
  },
  {
    kind: "simulator-word",
    buttonId: "simBtn",
    inputId: "simInput",
    zoneId: "simZone",
    textId: "simText",
    statusId: "simStatus"
  }
];

uploadConfigs.forEach(wireUpload);

function renderDiagnosticTask(state: AppState): void {
  const bundle = state.diagnosticDataBundle;
  if (!bundle || bundle.tasks.length === 0) return;
  const safeIndex = Math.max(0, Math.min(state.currentDiagnosticTaskIndex, bundle.tasks.length - 1));
  const task = bundle.tasks[safeIndex];
  if (!task) return;
  const title = document.querySelector<HTMLElement>("#diagTaskTitle");
  const skill = document.querySelector<HTMLElement>("#diagTaskSkill");
  const question = document.querySelector<HTMLElement>("#diagTaskQuestion");
  const guidance = document.querySelector<HTMLElement>("#diagTaskGuidance");
  const answer = document.querySelector<HTMLTextAreaElement>("#diagTaskAnswer");
  const counter = document.querySelector<HTMLElement>("#diagTaskCounter");
  const nextBtn = document.querySelector<HTMLButtonElement>("#diagTaskNextBtn");
  const progress = document.querySelector<HTMLElement>("#diagTaskProgress");
  const dataset = document.querySelector<HTMLElement>("#diagTaskDataset");
  if (title) title.textContent = `Задание ${safeIndex + 1} из ${bundle.tasks.length}`;
  if (skill) skill.textContent = `Навык: ${task.skillName}`;
  if (question) question.textContent = task.question;
  if (guidance) guidance.textContent = task.guidance ?? "";
  if (answer) {
    const saved = state.diagnosticAnswers[task.id]?.text ?? "";
    if (answer.value !== saved) answer.value = saved;
  }
  if (counter) counter.textContent = `${(answer?.value ?? "").trim().length} символов`;
  if (nextBtn) {
    nextBtn.textContent = safeIndex === bundle.tasks.length - 1
      ? "Завершить диагностику"
      : "Далее";
  }
  if (progress) {
    const percent = Math.round(((safeIndex + 1) / bundle.tasks.length) * 100);
    progress.style.width = `${percent}%`;
  }
  if (dataset) {
    dataset.hidden = true;
    const numericFacts = task.inputData?.numericFacts ?? [];
    const tableRows = task.inputData?.tableRows ?? [];
    if (numericFacts.length === 0 && tableRows.length === 0) {
      dataset.innerHTML = "";
      return;
    }
    const factsHtml = numericFacts.length > 0
      ? `<h3>Данные для расчета</h3><ul class="fact-list section-gap-top">${numericFacts
        .map((fact) => `<li><strong>${fact.name}:</strong> ${fact.value}${fact.unit ? ` ${fact.unit}` : ""}</li>`)
        .join("")}</ul>`
      : "";
    const tableHtml = tableRows.length > 0
      ? (() => {
        const columns = Object.keys(tableRows[0] ?? {});
        return `<h3>Исходные данные</h3>
          <div class="task-table-wrap section-gap-top">
            <table class="task-table">
              <thead><tr>${columns.map((col) => `<th>${col}</th>`).join("")}</tr></thead>
              <tbody>${tableRows
                .map((row) => `<tr>${columns.map((col) => `<td>${String(row[col] ?? "")}</td>`).join("")}</tr>`)
                .join("")}</tbody>
            </table>
          </div>`;
      })()
      : "";
    dataset.innerHTML = `${factsHtml}${factsHtml && tableHtml ? '<div class="section-gap-top"></div>' : ""}${tableHtml}`;
    dataset.hidden = false;
  }
}

function renderDiagnosticResults(state: AppState): void {
  const grid = document.getElementById("diagResultsGrid");
  const summary = document.getElementById("diagSummaryText");
  const primary = document.getElementById("diagRecommendationsPrimary");
  const secondary = document.getElementById("diagRecommendationsSecondary");
  const selectors = document.getElementById("diagSkillSelectors");
  if (!grid || !summary || !primary || !secondary || !selectors) return;
  grid.innerHTML = state.diagnosticResults
    .map((result) => {
      const highlight = result.score <= 4 ? "result-highlight" : "";
      return `<div class="result ${highlight} stack-tight">
        <h3>${result.skillName}</h3>
        <div class="score">${result.score}/${result.maxScore}</div>
        <p>${result.comment}</p>
      </div>`;
    })
    .join("");
  summary.textContent = state.diagnosticSummary || "Оценка будет доступна после обработки.";
  const topRecommendations = state.diagnosticRecommendations.slice(0, 3);
  const optionalRecommendations = state.diagnosticRecommendations.slice(3, 6);
  primary.innerHTML = topRecommendations.map((item) => `<span class="chip green">${item.skillName}</span>`).join("");
  secondary.innerHTML = optionalRecommendations.map((item) => `<span class="chip">${item.skillName}</span>`).join("");
  const allSkills = state.diagnosticRecommendations.map((item) => item.skillName);
  selectors.innerHTML = allSkills
    .map((skill) => {
      const checked = state.selectedSkillIds.includes(skill) ? "checked" : "";
      return `<label class="section-gap-sm"><input type="checkbox" data-skill-checkbox="${skill}" ${checked}/> ${skill}</label>`;
    })
    .join("");
  selectors.querySelectorAll<HTMLInputElement>("[data-skill-checkbox]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selected = [
        ...selectors.querySelectorAll<HTMLInputElement>("[data-skill-checkbox]:checked")
      ].map((item) => item.dataset.skillCheckbox ?? "");
      setSelectedSkillIds(selected.filter(Boolean));
    });
  });
}

function startDiagnosticProcessing(state: AppState): void {
  if (state.diagnosticStep !== "processing") {
    clearProcessingTimer();
    return;
  }
  if (state.diagnosticResults.length > 0) return;
  const bundle = state.diagnosticDataBundle;
  if (!bundle) return;
  const processingBar = document.getElementById("processingBar");
  if (!processingBar) return;
  let progress = 15;
  processingBar.style.width = `${progress}%`;
  clearProcessingTimer();
  processingTimerId = window.setInterval(() => {
    progress = Math.min(progress + 10, 95);
    processingBar.style.width = `${progress}%`;
  }, 350);
  const waitMs = 3200 + Math.floor(Math.random() * 1200);
  processingTimeoutId = window.setTimeout(async () => {
    clearProcessingTimer();
    const answerEntries = Object.values(getAppState().diagnosticAnswers);
    const evaluation = await evaluateDiagnosticAnswers({
      bundle,
      answers: answerEntries.map((item) => ({ taskId: item.taskId, text: item.text }))
    });
    setDiagnosticResults(evaluation.results);
    setDiagnosticRecommendations(evaluation.recommendations);
    setDiagnosticSummary(evaluation.summary);
    setSelectedSkillIds(evaluation.recommendations.slice(0, 3).map((item) => item.skillName));
    processingBar.style.width = "100%";
    goToDiagnosticStep("results");
  }, waitMs);
}

function bindTaskAnswerCounter(): void {
  const answer = document.querySelector<HTMLTextAreaElement>("#diagTaskAnswer");
  const counter = document.querySelector<HTMLElement>("#diagTaskCounter");
  if (!answer || !counter) return;
  answer.addEventListener("input", () => {
    counter.textContent = `${answer.value.trim().length} символов`;
    const state = getAppState();
    const currentTask = state.diagnosticDataBundle?.tasks[state.currentDiagnosticTaskIndex];
    if (!currentTask) return;
    upsertDiagnosticAnswer({
      taskId: currentTask.id,
      text: answer.value,
      updatedAt: new Date().toISOString()
    });
  });
}

bindTaskAnswerCounter();

function renderSimulatorSkills(state: AppState): void {
  const grid = document.getElementById("simSkillsGrid");
  if (!grid) return;
  if (!state.simulatorDataReady) {
    grid.innerHTML = `<div class="skill"><h3>Список навыков недоступен</h3><p>Загрузите Word с контентом симулятора.</p></div>`;
    return;
  }
  grid.innerHTML = state.simulatorSkills
    .map((skill) => {
      const progress = state.simulatorProgress[skill.skillId] ?? 0;
      const status = progress >= skill.blocks.length
        ? "завершен"
        : progress > 0
          ? "в процессе"
          : "не начат";
      const isRecommended = state.selectedSkillIds.includes(skill.skillId) || state.selectedSkillIds.includes(skill.title ?? "");
      return `<div class="skill ${isRecommended ? "result-highlight" : ""}">
        <h3>${skill.title ?? skill.skillId}</h3>
        <p>${skill.description ?? "Практика навыка на сценарных блоках."}</p>
        <p>Статус: ${status}</p>
        <div class="chips">${isRecommended ? '<span class="chip green">Рекомендован</span>' : ""}</div>
        <button class="button ${progress > 0 && progress < skill.blocks.length ? "secondary" : "primary"}" data-open-skill="${skill.skillId}">
          ${progress > 0 && progress < skill.blocks.length ? "Продолжить" : "Начать навык"}
        </button>
      </div>`;
    })
    .join("");
  grid.querySelectorAll<HTMLButtonElement>("[data-open-skill]").forEach((button) => {
    button.addEventListener("click", () => {
      const skillId = button.dataset.openSkill;
      if (!skillId) return;
      setCurrentSkillId(skillId);
      if (getAppState().simulatorProgress[skillId] === undefined) {
        setSimulatorSkillProgress(skillId, 0);
      }
      goToSimulatorStep("session");
    });
  });
}

function renderSimulatorSession(state: AppState): void {
  const title = document.getElementById("simSessionTitle");
  const step = document.getElementById("simSessionStep");
  const progressBar = document.getElementById("simSessionProgress");
  const content = document.getElementById("simSessionContent");
  const nextBtn = document.querySelector<HTMLButtonElement>("#simSessionNextBtn");
  if (!title || !step || !progressBar || !content || !nextBtn) return;
  const skill = getCurrentSimulatorSkill(state);
  if (!skill) {
    title.textContent = "Прохождение навыка";
    step.textContent = "Шаг 0";
    content.innerHTML = "<div class='block'><h3>Навык не выбран</h3><p>Вернитесь к списку навыков.</p></div>";
    return;
  }
  const progress = state.simulatorProgress[skill.skillId] ?? 0;
  const block = skill.blocks[progress];
  title.textContent = `Прохождение навыка: ${skill.title ?? skill.skillId}`;
  if (!block) {
    step.textContent = `Шаг ${skill.blocks.length} из ${skill.blocks.length}`;
    progressBar.style.width = "100%";
    content.innerHTML = "<div class='block subtle'><h3>Навык завершен</h3><p>Переходите к итогу навыка.</p></div>";
    nextBtn.textContent = "К результату";
    return;
  }
  step.textContent = `Шаг ${progress + 1} из ${skill.blocks.length}`;
  progressBar.style.width = `${Math.round(((progress + 1) / skill.blocks.length) * 100)}%`;
  nextBtn.textContent = progress === skill.blocks.length - 1 ? "Завершить навык" : "Далее";
  const answer = state.simulatorAnswers.find((item) => item.skillId === skill.skillId && item.blockId === block.id);
  if (block.type === "theory" || block.type === "case-description" || block.type === "feedback") {
    content.innerHTML = `<div class="block subtle"><h3>${block.title}</h3><p>${block.content}</p></div>`;
    return;
  }
  if (block.type === "choice-question") {
    const selected = answer?.value ?? "";
    content.innerHTML = `<div class="block">
      <h3>${block.question}</h3>
      <div class="option-list">
        ${block.options.map((option, idx) => `<label class="option">
          <span>${option}</span>
          <input type="radio" name="sim-choice-${block.id}" value="${idx}" ${selected === String(idx) ? "checked" : ""}/>
        </label>`).join("")}
      </div>
    </div>`;
    return;
  }
  content.innerHTML = `<div class="block">
    <h3>${block.question}</h3>
    <textarea class="textarea" id="sim-open-${block.id}" placeholder="Введите ответ">${answer?.value ?? ""}</textarea>
    <p class="meta">Минимум ${block.minLength} символов</p>
  </div>`;
}

function renderSimulatorResults(state: AppState): void {
  const score = document.getElementById("simResultScore");
  const openStatus = document.getElementById("simResultOpenStatus");
  if (!score || !openStatus) return;
  const skill = getCurrentSimulatorSkill(state);
  if (!skill) {
    score.textContent = "0%";
    openStatus.textContent = "Сначала выберите и пройдите навык.";
    return;
  }
  const result = state.simulatorResults.find((item) => item.skillId === skill.skillId);
  const answers = state.simulatorAnswers.filter((item) => item.skillId === skill.skillId);
  const evaluation = evaluateSimulatorSkill({ skill, answers });
  score.textContent = `${result?.percentage ?? evaluation.percentage}%`;
  openStatus.textContent = evaluation.openQuestionStatus;
}

function renderFromState(state: AppState): void {
  showTopScreen(state.currentScreen);
  showDiagStep(state.diagnosticStep);
  showSimStep(state.simulatorStep);
  uploadConfigs.forEach((config) => {
    if (config.kind === "diagnostic-excel") applyUploadStateToDom(config, state.diagnosticExcelUpload);
    if (config.kind === "diagnostic-word") applyUploadStateToDom(config, state.diagnosticWordUpload);
    if (config.kind === "simulator-word") applyUploadStateToDom(config, state.simulatorWordUpload);
  });
  const caseText = document.getElementById("diagnosticCaseText");
  const taskCountChip = document.getElementById("diagTaskCountChip");
  if (caseText && state.diagnosticDataBundle?.caseDescription) {
    caseText.textContent = state.diagnosticDataBundle.caseDescription;
  }
  if (taskCountChip && state.diagnosticDataBundle?.tasks?.length) {
    taskCountChip.textContent = `${state.diagnosticDataBundle.tasks.length} заданий`;
  }
  renderDiagnosticTask(state);
  renderDiagnosticResults(state);
  startDiagnosticProcessing(state);
  renderSimulatorSkills(state);
  renderSimulatorSession(state);
  renderSimulatorResults(state);
  const startButton = document.querySelector<HTMLButtonElement>("#startDiagnosticBtn");
  const errorText = document.querySelector<HTMLElement>("#diagnosticUploadError");
  const isReadyToStart = state.diagnosticDataReady;
  if (startButton) {
    startButton.disabled = !isReadyToStart;
  }
  if (errorText) {
    if (state.diagnosticUploadError) {
      errorText.hidden = false;
      errorText.textContent = state.diagnosticUploadError;
    } else {
      errorText.hidden = true;
      errorText.textContent = "";
    }
  }
}

preloadDiagnosticBundle().finally(() => {
  renderFromState(getAppState());
});
subscribeToAppState(renderFromState);
