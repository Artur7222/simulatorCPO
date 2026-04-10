import "./styles.css";
import { goToDiagnosticStep, goToSimulatorStep, goToTopLevelScreen } from "./router/screenRouter";
import { getAppState, subscribeToAppState } from "./state/appState";
import type { AppState, DiagnosticStepId, SimulatorStepId, TopLevelScreenId } from "./types/app";

const app = document.querySelector<HTMLDivElement>("#app");

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
                    <span class="chip purple">11 заданий</span>
                  </div>
                  <p>Кейс: продукт сталкивается с замедлением активации и снижением конверсии в ключевом пользовательском сценарии. Ваша задача — проанализировать проблему и предложить продуктовые решения.</p>
                  <div class="footer-actions section-gap-top">
                    <button class="button primary" data-diag-next="task">Начать диагностику</button>
                  </div>
                </div>
                <div class="card result-highlight">
                  <h3>Формат прохождения</h3>
                  <p>11 последовательных заданий, сохранение ответов и переход к результатам после завершения анализа.</p>
                </div>
              </div>
              <div class="panel" data-diag-view="task" hidden>
                <div class="section-title">
                  <h3>Задание 5 из 11</h3>
                  <span class="chip">Навык: Гипотезы</span>
                </div>
                <div class="progress section-gap-top"><span class="progress-45"></span></div>
                <div class="block subtle section-gap-top">
                  <h3>Какую гипотезу вы бы проверили первой и почему?</h3>
                  <p>Опишите логику выбора, влияние на ключевую метрику и способ оценки результата после эксперимента.</p>
                </div>
                <div class="field section-gap-top">
                  <label>Ответ</label>
                  <textarea class="textarea">Я бы начал с гипотезы, которая влияет на активацию в первом ценном действии пользователя. Затем определил бы ключевую метрику, guardrail-метрики и критерии успеха эксперимента...</textarea>
                </div>
                <div class="meta">
                  <span>Минимум 50 символов</span>
                  <span>168 символов</span>
                </div>
                <div class="footer-actions section-gap-top">
                  <button class="button ghost" data-diag-next="intro">Назад</button>
                  <button class="button primary" data-diag-next="processing">Завершить диагностику</button>
                </div>
              </div>
              <div class="panel result-highlight" data-diag-view="processing" hidden>
                <div class="section-title">
                  <h3>Анализ ответов</h3>
                  <span class="chip purple">AI-ready</span>
                </div>
                <p>Оцениваем ответы, формируем комментарии и рекомендации по навыкам.</p>
                <div class="progress section-gap-top"><span id="processingBar" class="progress-15"></span></div>
                <div class="footer-actions section-gap-top">
                  <button class="button ghost" data-diag-next="task">Назад</button>
                  <button class="button primary" id="finishProcessing">Показать результаты</button>
                </div>
              </div>
              <div data-diag-view="results" hidden>
                <div class="row-3">
                  <div class="result result-highlight stack-tight">
                    <h3>Анализ рынка</h3>
                    <div class="score">4/6</div>
                    <div class="chips"><span class="chip green">Рекомендован</span></div>
                  </div>
                  <div class="result stack-tight">
                    <h3>Метрики продукта</h3>
                    <div class="score">5/6</div>
                    <div class="chips"><span class="chip">Сильная зона</span></div>
                  </div>
                  <div class="result result-highlight stack-tight">
                    <h3>Гипотезы</h3>
                    <div class="score">3/6</div>
                    <div class="chips"><span class="chip green">Рекомендован</span></div>
                  </div>
                </div>
                <div class="row section-gap-top">
                  <div class="panel">
                    <h3>Комментарии</h3>
                    <p>Ответы структурированы, но в ряде кейсов не хватает приоритизации и связки между решением, метрикой и ожидаемым эффектом.</p>
                  </div>
                  <div class="panel">
                    <h3>Рекомендации</h3>
                    <div class="chips section-gap-top">
                      <span class="chip green">Анализ рынка</span>
                      <span class="chip green">Гипотезы</span>
                      <span class="chip green">Метрики</span>
                    </div>
                    <div class="footer-actions section-gap-top">
                      <button class="button ghost" data-diag-next="task">Назад</button>
                      <button class="button primary" id="toSimulator">Перейти в симулятор</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="upload-zone">
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
                    <input class="hidden-input" id="wordInput" type="file" accept=".docx" />
                  </div>
                </div>
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
                <div class="skill-grid section-gap-top">
                  <div class="skill">
                    <h3>Анализ рынка</h3>
                    <p>Статус: не начат</p>
                    <div class="chips"><span class="chip green">Рекомендован</span></div>
                    <button class="button secondary">Открыть</button>
                  </div>
                  <div class="skill result-highlight">
                    <h3>Метрики продукта</h3>
                    <p>Статус: в процессе</p>
                    <div class="chips"><span class="chip green">Рекомендован</span></div>
                    <button class="button secondary">Открыть</button>
                  </div>
                  <div class="skill result-highlight">
                    <h3>Гипотезы</h3>
                    <p>Статус: не начат</p>
                    <div class="chips"><span class="chip green">Рекомендован</span></div>
                    <button class="button primary" data-sim-next="session">Начать навык</button>
                  </div>
                </div>
              </div>
              <div class="panel" data-sim-view="session" hidden>
                <div class="section-title">
                  <h3>Прохождение навыка: Гипотезы</h3>
                  <span class="chip">Шаг 3 из 8</span>
                </div>
                <div class="progress section-gap-top"><span class="progress-38"></span></div>
                <div class="stack section-gap-top">
                  <div class="block subtle">
                    <h3>Теория</h3>
                    <p>Сильная продуктовая гипотеза описывает изменение, целевой сегмент, ожидаемое изменение поведения и измеримый эффект на метрику.</p>
                  </div>
                  <div class="block subtle">
                    <h3>Кейс</h3>
                    <p>Команда видит падение активации в онбординге. Нужно определить первую гипотезу для теста и способ оценки результата.</p>
                  </div>
                </div>
                <div class="block section-gap-top">
                  <h3>Какой вариант вы выберете?</h3>
                  <div class="option-list">
                    <div class="option active">
                      <span>Сократить число шагов онбординга</span>
                      <span class="chip purple">Выбрано</span>
                    </div>
                    <div class="option"><span>Добавить больше подсказок на каждом экране</span></div>
                    <div class="option"><span>Расширить форму сбора профиля</span></div>
                  </div>
                </div>
                <div class="block section-gap-top" style="background:#f6fff8;border-color:#ccefd9;">
                  <h3>Обратная связь</h3>
                  <p>Вы выбрали наиболее проверяемую гипотезу: она устраняет ключевое трение в сценарии и позволяет быстро измерить эффект на activation.</p>
                </div>
                <div class="footer-actions section-gap-top">
                  <button class="button ghost" data-sim-next="skills">Назад</button>
                  <button class="button primary" data-sim-next="results">Завершить навык</button>
                </div>
              </div>
              <div data-sim-view="results" hidden>
                <div class="row">
                  <div class="result result-highlight stack-tight">
                    <h3>Итог по навыку</h3>
                    <div class="score">78%</div>
                    <p>по закрытым вопросам</p>
                  </div>
                  <div class="result stack-tight">
                    <h3>Статус открытых ответов</h3>
                    <p>Содержательно, но можно усилить аргументацию выбора и критерии успеха.</p>
                  </div>
                </div>
                <div class="footer-actions section-gap-top">
                  <button class="button ghost" data-sim-next="session">Назад</button>
                  <button class="button primary" data-sim-next="skills">К навыкам</button>
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
                  <input class="hidden-input" id="simInput" type="file" accept=".docx" />
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

document.querySelectorAll<HTMLButtonElement>("[data-diag-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStep = button.dataset.diagStep as DiagnosticStepId | undefined;
    if (!nextStep) return;
    goToDiagnosticStep(nextStep);
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-diag-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStep = button.dataset.diagNext as DiagnosticStepId | undefined;
    if (!nextStep) return;
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

document.querySelectorAll<HTMLButtonElement>("[data-sim-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStep = button.dataset.simNext as SimulatorStepId | undefined;
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

type UploadConfig = {
  buttonId: string;
  inputId: string;
  zoneId: string;
  textId: string;
  statusId: string;
  successText: string;
};

function wireUpload(config: UploadConfig): void {
  const button = document.getElementById(config.buttonId);
  const input = document.getElementById(config.inputId) as HTMLInputElement | null;
  const zone = document.getElementById(config.zoneId);
  const text = document.getElementById(config.textId);
  const status = document.getElementById(config.statusId);

  if (!button || !input || !zone || !text || !status) return;

  button.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;
    zone.classList.add("good");
    text.textContent = file.name;
    status.textContent = config.successText;
    status.className = "status ok";
  });
}

[
  {
    buttonId: "excelBtn",
    inputId: "excelInput",
    zoneId: "excelZone",
    textId: "excelText",
    statusId: "excelStatus",
    successText: "Загружен"
  },
  {
    buttonId: "wordBtn",
    inputId: "wordInput",
    zoneId: "wordZone",
    textId: "wordText",
    statusId: "wordStatus",
    successText: "Загружен"
  },
  {
    buttonId: "simBtn",
    inputId: "simInput",
    zoneId: "simZone",
    textId: "simText",
    statusId: "simStatus",
    successText: "Загружен"
  }
].forEach(wireUpload);

document.querySelector<HTMLButtonElement>("#finishProcessing")?.addEventListener("click", () => {
  const processingBar = document.getElementById("processingBar");
  if (processingBar) {
    processingBar.style.width = "100%";
  }
  window.setTimeout(() => goToDiagnosticStep("results"), 300);
});

function renderFromState(state: AppState): void {
  showTopScreen(state.currentScreen);
  showDiagStep(state.diagnosticStep);
  showSimStep(state.simulatorStep);
}

renderFromState(getAppState());
subscribeToAppState(renderFromState);
