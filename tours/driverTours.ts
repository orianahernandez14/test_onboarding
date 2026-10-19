import { driver } from "driver.js";
import type { View, DisplayMode } from "../types";

const base = () =>
  driver({
    showProgress: true,
    overlayOpacity: 0.6,
    allowClose: true,
    animate: true,
    smoothScroll: true,

    nextBtnText: "Siguiente",
    prevBtnText: "Anterior",
    doneBtnText: "Finalizar",
    progressText: "{{current}} de {{total}}",
  });

export function runLandingTour() {
  const d = base();

  d.setSteps([
    {
      element: '[data-tour="landing-demo"]',
      popover: { title: "Demo completo", description: "Empezá por acá para recorrer la herramienta." },
    },
    {
      element: '[data-tour="landing-ingresante"]',
      popover: { title: "Ingresante", description: "Ver el plan de onboarding y completar tareas." },
    },
    {
      element: '[data-tour="landing-lider"]',
      popover: { title: "Líder / Mentor", description: "Gestionar tareas y acompañar el ingreso." },
    },
    {
      element: '[data-tour="landing-admin"]',
      popover: { title: "Administrador", description: "Visión global del piloto." },
    },
  ]);

  setTimeout(() => d.drive(), 50);
}

export function runAppTour(opts: {
  currentView: View; // 'newHire' | 'leader' | 'admin'
  goToTab: (tab: DisplayMode) => void;
  appMode: "demo" | "isolated";
}) {
  const { currentView, goToTab, appMode } = opts;

  const isNewHire = currentView === "newHire";
  const isLeaderOrAdmin = currentView === "leader" || currentView === "admin";

  const steps: any[] = [];

  // ✅ SOLO DEMO COMPLETO
  if (appMode === "demo") {
    steps.push({
      element: '[data-tour="app-cambiar-vista"]',
      popover: {
        title: "Cambiar vista",
        description: "Desde acá alternás Ingresante / Líder / Admin.",
      },
    });
  }

  // ✅ LÍDER/ADMIN (también en isolated)
  if (isLeaderOrAdmin) {
    steps.push({
      element: '[data-tour="app-selector-perfil"]',
      popover: {
        title: "Elegir ingresante",
        description: "Seleccioná equipo e ingresante para ver/editar su plan.",
      },
    });
  }

  // ✅ Tabs (todos)
  steps.push(
    {
      element: '[data-tour="app-tab-tablero"]',
      popover: { title: "Tablero", description: "Vista principal: tareas por día (drag & drop)." },
      onHighlightStarted: () => goToTab("board"),
    },
    {
      element: '[data-tour="app-tab-calendario"]',
      popover: { title: "Calendario", description: "Visualizá hitos y eventos del onboarding." },
      onHighlightStarted: () => goToTab("calendar"),
    },
    {
      element: '[data-tour="app-tab-repositorio"]',
      popover: { title: "Repositorio", description: "Recursos y materiales institucionales / de equipo." },
      onHighlightStarted: () => goToTab("repository"),
    }
  );

  // ✅ Métricas SOLO líder/admin (también en isolated)
  if (isLeaderOrAdmin) {
    steps.push({
      element: '[data-tour="app-tab-metricas"]',
      popover: {
        title: "Métricas",
        description: "Seguimiento del progreso del onboarding (líder/admin).",
      },
      onHighlightStarted: () => goToTab("analytics"),
    });
  }

  // ✅ FAB: en tu app solo aparece para leader/admin (vos lo renderizás así)
  if (isLeaderOrAdmin) {
    steps.push(
      {
        element: '[data-tour="app-fab-plus"]',
        popover: {
          title: "Agregar tareas",
          description:
            "En Tablero, este botón crea nuevas tareas. También podés agregar tareas desde el botón “+” dentro de cada día.",
        },
        onHighlightStarted: () => goToTab("board"),
      },
      {
        element: '[data-tour="app-fab-plus"]',
        popover: {
          title: "Agregar recursos",
          description:
            "En Repositorio, este mismo botón abre el formulario para cargar nuevos recursos (links, documentos, etc.).",
        },
        onHighlightStarted: () => goToTab("repository"),
      }
    );
  }

  // ✅ Chat: todos
  steps.push({
    element: '[data-tour="app-chat"]',
    popover: {
      title: "Chat",
      description: "Consultá dudas sobre la herramienta durante el recorrido.",
    },
  });

  const d = base();
  d.setSteps(steps);
  setTimeout(() => d.drive(), 50);
}