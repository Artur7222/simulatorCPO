import "./styles.css";
import { goToDiagnosticStep, goToSimulatorStep, goToTopLevelScreen } from "./router/screenRouter";
import { getAppState } from "./state/appState";
import type { DiagnosticStepId, SimulatorStepId, TopLevelScreenId } from "./types/app";

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
                  <button class="step-btn active" data-diag-step="diagnostic-intro">Вступление</button>
                  <button class="step-btn" data-diag-step="diagnostic-task">Задание</button>
                  <button class="step-btn" data-diag-step="diagnostic-processing">Анализ</button>
                  <button class="step-btn" data-diag-step="diagnostic-results">Результаты</button>
                </div>
              </div>
              <div class="demo-stage">
                <div data-diag-view="diagnostic-intro">Вступление в диагностику</div>
                <div data-diag-view="diagnostic-task" hidden>Задание (MVP реализация в следующих фазах)</div>
                <div data-diag-view="diagnostic-processing" hidden>Анализ ответов (MVP реализация в следующих фазах)</div>
                <div data-diag-view="diagnostic-results" hidden>
                  Результаты диагностики
                  <div class="section-gap-top">
                    <button class="button primary" id="toSimulator">Перейти в симулятор</button>
                  </div>
                </div>
                <div class="footer-actions section-gap-top">
                  <button class="button ghost" data-diag-next="diagnostic-intro">Intro</button>
                  <button class="button secondary" data-diag-next="diagnostic-task">Task</button>
                  <button class="button secondary" data-diag-next="diagnostic-processing">Processing</button>
                  <button class="button secondary" data-diag-next="diagnostic-results">Results</button>
                </div>
              </div>
            </section>
            <section class="screen" id="screen-simulator">
              <div class="section-header">
                <h3>Симулятор продуктовых навыков</h3>
                <div class="stepper">
                  <button class="step-btn active" data-sim-step="simulator-skills">Навыки</button>
                  <button class="step-btn" data-sim-step="simulator-session">Прохождение</button>
                  <button class="step-btn" data-sim-step="simulator-results">Итог</button>
                </div>
              </div>
              <div class="demo-stage">
                <div data-sim-view="simulator-skills">Выбор навыков</div>
                <div data-sim-view="simulator-session" hidden>Прохождение навыка</div>
                <div data-sim-view="simulator-results" hidden>Итог навыка</div>
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
  viewDataKey: "diagView" | "simView",
  onStepSelected: (step: DiagnosticStepId | SimulatorStepId) => void
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
    onStepSelected(id);
  };

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const step = button.dataset[stepDataKey];
      if (!step) return;
      activate(step as DiagnosticStepId | SimulatorStepId);
    });
  });

  return activate;
}

const showDiagStep = bindStepGroup(
  "[data-diag-step]",
  "[data-diag-view]",
  "diagStep",
  "diagView",
  (step) => goToDiagnosticStep(step as DiagnosticStepId)
);
const showSimStep = bindStepGroup(
  "[data-sim-step]",
  "[data-sim-view]",
  "simStep",
  "simView",
  (step) => goToSimulatorStep(step as SimulatorStepId)
);

document.querySelectorAll<HTMLButtonElement>("[data-diag-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStep = button.dataset.diagNext as DiagnosticStepId | undefined;
    if (!nextStep) return;
    showDiagStep(nextStep);
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-sim-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStep = button.dataset.simNext as SimulatorStepId | undefined;
    if (!nextStep) return;
    showSimStep(nextStep);
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
  showTopScreen("simulator");
});

const state = getAppState();
showTopScreen(state.currentScreen);
showDiagStep(state.diagnosticStep);
showSimStep(state.simulatorStep);
