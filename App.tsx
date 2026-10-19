
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Task, TaskType, View, OnboardingInfo, KnowledgeItem, DisplayMode, OnboardingProfile, AppMode } from './types';
import { DAYS } from './constants';
import { Header } from './components/Header';
import { DayColumn } from './components/DayColumn';
import { TaskFormModal } from './components/TaskFormModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { KnowledgeItemFormModal } from './components/KnowledgeItemFormModal';
import { TaskCard } from './components/TaskCard';
import { Toast } from './components/Toast';
import { OnboardingInfoDisplay } from './components/OnboardingInfoDisplay';
import { OnboardingInfoFormModal } from './components/OnboardingInfoFormModal';
import { ViewControls } from './components/ViewControls';
import { PlusIcon } from './components/Icons';
import { FilterControls } from './components/FilterControls';
import { RepositoryView } from './components/KnowledgeRepositoryView';
import { CalendarView } from './components/CalendarView';
import { Chatbot } from './components/Chatbot';
import { LeaderChatbot } from './components/LeaderChatbot';
import { DataService } from './services/dataService';
import { AnalyticsView } from './components/AnalyticsView';
import { getOnboardingStartDate, getDateForDayAndWeek, formatDateForDayColumn, getDayAndWeekFromDate } from './utils/date';
import { LandingPage } from './components/LandingPage';
import { BrandLogo } from './components/BrandLogo';
import footerLogo from './assets/logoba.png';
import { ConfirmationModal } from './components/ConfirmationModal';
import { apiGet, apiPost, apiPatch } from './services/api';
import 'driver.js/dist/driver.css';
import { runAppTour } from './tours/driverTours';
import { defaultTasks } from './data/defaultTasks';

const emptyOnboardingInfo: OnboardingInfo = {
  profileId: '',
  newHireName: '',
  jobTitle: '',
  jobSummary: '',
  teamName: '',
  teamFunctions: '',
  teamMembers: '',
  managerId: '',
  manager: '',
  managerPosition: '',
  teamLead: '',
  teamLeadPosition: '',
  jurisdiction: '',
  onboardingStartDate: '',
  documentationDeadline: '',
  deskNumber: '',
  workEquipment: '',
  workAddress: '',
  remoteWorkDay: '',
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'app'>('landing');
  const [appMode, setAppMode] = useState<AppMode>('demo');
  const [view, setView] = useState<View>('leader');
  const [currentUser, setCurrentUser] = useState<string>('Carlos Gómez');
  const [isSyncing, setIsSyncing] = useState(false);
  const isApi = (import.meta.env.VITE_DATA_SOURCE ?? 'local') === 'api';

  const [profiles, setProfiles] = useState<OnboardingProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string>('');
  const [leaderProfileIds, setLeaderProfileIds] = useState<string[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskType | 'all'>('all');
  const [completionStatusFilter, setCompletionStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDayFilter, setMobileDayFilter] = useState<'all' | string>('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState<'edit' | 'create'>('edit');
  const [draftInfo, setDraftInfo] = useState<OnboardingInfo | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingKnowledgeItem, setEditingKnowledgeItem] = useState<KnowledgeItem | null>(null);
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [prefillDayLabel, setPrefillDayLabel] = useState<string | null>(null);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<null | (() => Promise<void> | void)>(null);

  const openConfirm = (title: string, message: string, action: () => Promise<void> | void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setPendingAction(() => action);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const openTaskDetail = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  }, []);

  const closeTaskDetail = useCallback(() => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  // 🔹 Normalización única y global
  const normalizeDay = (d: any): number => {
   if (typeof d === 'number') return d;
   // "Día 3" -> 3, "3" -> 3, "Dia 3" -> 3
      const n = Number(String(d).replace('Día', '').replace('Dia', '').trim());
      return Number.isFinite(n) ? n : 1;
    };

  const normalizeKnowledgeItem = (ki: any): KnowledgeItem => ({
    ...ki,
    // por si API manda 'Y'/'N' o 'true'/'false' como string
    isGlobal:
      typeof ki?.isGlobal === 'boolean'
        ? ki.isGlobal
        : ki?.isGlobal === 'Y' || ki?.isGlobal === 'true',
    // por si profileId viene number
    profileId: ki?.profileId != null ? String(ki.profileId) : undefined,
    teamName: (ki?.teamName ?? '') || undefined,
  });
  
    // Acepta Task o Partial Task (por el modal)
  const normalizeTask = (t: any): Task => ({
    ...t,
    day: normalizeDay(t.day ?? 1),
    week: Number(t.week ?? 1),
    linkedKnowledgeItemIds: Array.isArray(t.linkedKnowledgeItemIds)
    ? t.linkedKnowledgeItemIds
    : [], 
    isGlobal: !!t.isGlobal,
    globalTaskId: t.globalTaskId,
  });

  useEffect(() => {
    const loadData = async () => {
        const p = await DataService.getProfiles();
        const k = await DataService.getKnowledgeItems();

        const normalizedProfiles = (p ?? []).map(profile => ({
          ...profile,
          tasks: (profile.tasks ?? []).map(normalizeTask),
        }));

        setProfiles(normalizedProfiles);
        setKnowledgeItems((k ?? []).map(normalizeKnowledgeItem));
        
        if (normalizedProfiles.length > 0) {
          setCurrentProfileId(prev =>
            prev && normalizedProfiles.some(p => p.id === prev)
              ? prev
              : normalizedProfiles[0].id
          );
        }

        const session = sessionStorage.getItem('startmap_session');
        if (session) {
            const { mode, view: v } = JSON.parse(session);
            setAppMode(mode);
            setView(v);
            setCurrentPage('app');
        }
    };
    loadData();
  }, []);

  const accessibleProfiles = useMemo(() => {
    const safeProfiles = (profiles ?? []).filter(
      p =>
        !p.status ||
        (p.status !== 'cancelled' &&
        p.status !== 'archived')
    );

    if (view === 'admin') return safeProfiles;

    if (view === 'leader') {
      const byLeaderIds =
        leaderProfileIds.length > 0
          ? safeProfiles.filter(p =>
              leaderProfileIds.includes(p.id)
            )
          : [];

      if (byLeaderIds.length > 0) {
        return byLeaderIds;
      }

      if (appMode === 'demo') {
        return safeProfiles.filter(
          p =>
            p.info.managerId === currentUser ||
            p.info.manager === currentUser
        );
      }

      return safeProfiles.filter(
        p =>
          p.info.managerId === currentUser ||
          p.info.manager === currentUser
      );
    }

    return safeProfiles.filter(p => p?.id === currentProfileId);
  }, [profiles, view, currentProfileId, leaderProfileIds, appMode]);

  useEffect(() => {
    if (accessibleProfiles.length === 0) return;

    const currentExists = accessibleProfiles.some(
      p => p.id === currentProfileId
    );

    if (!currentExists) {
      setCurrentProfileId(accessibleProfiles[0].id);
    }
  }, [accessibleProfiles, currentProfileId]);

  useEffect(() => {
    if (view === 'leader') return;
    if (!accessibleProfiles || accessibleProfiles.length === 0) return;

    const exists = accessibleProfiles.some(p => p.id === currentProfileId);

    if (!exists) {
      setCurrentProfileId(accessibleProfiles[0].id);
    }
  }, [view, accessibleProfiles, currentProfileId]);

  useEffect(() => {
    if (view !== 'leader') return;

    const profile = accessibleProfiles.find(p => p.id === currentProfileId);
    const profileTeam = profile?.info?.teamName?.trim() ?? '';

    if (!selectedTeam && profileTeam) {
      setSelectedTeam(profileTeam);
    }
  }, [view, accessibleProfiles, currentProfileId, selectedTeam]);

  useEffect(() => {
    setMobileDayFilter('all');
  }, [selectedWeek]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);

    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  const currentProfile = useMemo<OnboardingProfile | null>(() => {
    if (!accessibleProfiles || accessibleProfiles.length === 0) return null;

    return (
      accessibleProfiles.find(p => p.id === currentProfileId) ??
      accessibleProfiles[0] ??
      null
    );
  }, [accessibleProfiles, currentProfileId]);

  const updateCurrentProfile = useCallback(
    async (updates: Partial<OnboardingProfile>) => {
      const targetId = currentProfile?.id ?? currentProfileId;
      const newId = updates.id ?? targetId;

      const duplicatedId = profiles.some(p =>
        p.id === newId && p.id !== targetId
      );

      if (duplicatedId) {
        showToast?.('Ya existe un ingresante con ese CUIL/ID');
        return;
      }

      const nextProfiles = profiles.map(p =>
        p.id === targetId
          ? {
              ...p,
              ...updates,
              info: {
                ...p.info,
                ...updates.info,
                profileId: newId,
              },
            }
          : p
      );

      setProfiles(nextProfiles);

      if (newId !== targetId) {
        setCurrentProfileId(newId);
      }

      try {
        await DataService.saveProfiles(nextProfiles);
      } catch (e) {
        console.error(e);
        showToast?.('No se pudo sincronizar con el servidor');
      }
    },
    [profiles, currentProfile?.id, currentProfileId, showToast, setCurrentProfileId]
  );

  const persistProfiles = useCallback(async (nextProfiles: OnboardingProfile[]) => {
  setProfiles(nextProfiles);
  try {
    await DataService.saveProfiles(nextProfiles);
  } catch (e) {
    console.error(e);
    showToast?.('No se pudo sincronizar con el servidor');
  }
}, [showToast]);

  const filteredTasks = useMemo(() => {
  
  const safeTasks = currentProfile?.tasks ?? [];

  const base = view === 'admin'
    ? safeTasks.filter(t => !!t.isGlobal)   // ✅ solo institucional
    : safeTasks;

  return base.filter(t => {
    const matchesType = taskTypeFilter === 'all' || t?.type === taskTypeFilter;

    const matchesStatus =
      completionStatusFilter === 'all' ||
      (completionStatusFilter === 'completed' ? !!t?.completed : !t?.completed);

    const matchesWeek = t?.week === selectedWeek;

    return matchesType && matchesStatus && matchesWeek;
  });
}, [currentProfile, taskTypeFilter, completionStatusFilter, selectedWeek, view]);

  const filteredKnowledgeItems = useMemo(() => {
    console.log('[knowledge] raw items', knowledgeItems);

    const result = knowledgeItems.filter(item => {
        if (view === 'admin') return !!item.isGlobal;
        if (item.isGlobal) return true;
        if (item.profileId === currentProfileId) return true;
        if (item.teamName && currentProfile?.info.teamName && item.teamName === currentProfile.info.teamName) return true;
        return false;
    });

    return result;
  }, [knowledgeItems, currentProfileId, currentProfile?.info.teamName, view]);

    // === Tablero: fechas por onboarding (Día 1 = ingreso; 5 días hábiles por semana) ===
  const onboardingStart = useMemo(() => {
    const dateStr = currentProfile?.info?.onboardingStartDate;
    if (!dateStr) return new Date(); // fallback mientras carga
    return new Date(dateStr + 'T00:00:00');
  }, [currentProfile?.info?.onboardingStartDate]);

  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  const addBusinessDays = (start: Date, n: number) => {
    const date = new Date(start);
    date.setHours(0, 0, 0, 0);

    // si ingreso cae finde, llevar al próximo hábil
    while (isWeekend(date)) date.setDate(date.getDate() + 1);

    let added = 0;
    while (added < n) {
      date.setDate(date.getDate() + 1);
      if (!isWeekend(date)) added++;
    }
    return date;
  };

  const getBoardColumnDate = useCallback((dayLabel: string, week: number) => {
    const dayNumber = Number(String(dayLabel).replace('Día', '').trim()); // "Día 3" -> 3
    return getDateForDayAndWeek(dayNumber, week, onboardingStart);
  }, [onboardingStart]);

  const handleStartApp = useCallback((
    mode: AppMode,
    initialView: View,
    profileId?: string | null,
    profileIds?: string[]
  ) => {    
    setAppMode(mode);
    setView(initialView);
    setCurrentPage('app');

    setSelectedTeam('');

    if (initialView === 'leader') {
      setLeaderProfileIds(profileIds ?? []);
      if (profileIds?.length) setCurrentProfileId(profileIds[0]);
    } else {
      setLeaderProfileIds([]);
      if (profileId) setCurrentProfileId(profileId);
    }

    sessionStorage.setItem('startmap_session', JSON.stringify({
      mode,
      view: initialView,
      profileId,
      profileIds,
    }));
  }, []);

  const buildEmptyInfo = useCallback((): OnboardingInfo => ({
    profileId: '',
    newHireName: '',
    jobTitle: '',
    jobSummary: '',
    teamName: '',
    teamFunctions: '',
    teamMembers: '',
    managerId: '',
    manager: '',
    managerPosition: '',
    teamLead: '',
    teamLeadPosition: '',
    jurisdiction: '',
    onboardingStartDate: new Date().toISOString().split('T')[0],
    documentationDeadline: '',
    deskNumber: '',
    workEquipment: '',
    workAddress: '',
    remoteWorkDay: 'Ninguno',
  }), []);

const handleAddProfile = () => {
  setProfileModalMode('create');

  const baseInfo = buildEmptyInfo();

  const seededInfo =
    view === 'leader' && currentProfile?.info
      ? {
          ...baseInfo,
          teamName: currentProfile.info.teamName ?? '',
          managerId: currentProfile.info.managerId ?? '',
          manager: currentProfile.info.manager ?? '',
          managerPosition: currentProfile.info.managerPosition ?? '',
          teamLead: currentProfile.info.teamLead ?? '',
          teamLeadPosition: currentProfile.info.teamLeadPosition ?? '',
          jurisdiction: currentProfile.info.jurisdiction ?? '',
        }
      : baseInfo;

  setDraftInfo(seededInfo);
  setIsInfoModalOpen(true);
  showToast('Completa los datos del ingresante');
};

const handleProfileChange = (profileId: string) => {
  setCurrentProfileId(profileId);

  const profile = profiles.find(p => p.id === profileId);

  if (profile?.info?.teamName) {
    setSelectedTeam(profile.info.teamName);
  }
};

const handleDeleteProfile = async (profileId: string) => {
  const confirmed = window.confirm(
    '¿Seguro que querés cancelar este ingreso?'
  );

  if (!confirmed) return;

  const nextProfiles = profiles.map(p =>
    p.id === profileId
      ? {
          ...p,
          status: 'cancelled' as const,
        }
      : p
  );

  setProfiles(nextProfiles);

  try {
    await DataService.saveProfiles(nextProfiles);
  } catch (e) {
    console.error(e);
    showToast('No se pudo guardar');
  }

  if (currentProfileId === profileId) {
    const visibleProfiles = nextProfiles.filter(
      p =>
        p.status !== 'cancelled' &&
        p.status !== 'archived'
    );

    setCurrentProfileId(
      visibleProfiles.length > 0
        ? visibleProfiles[0].id
        : ''
    );
  }

  showToast('Ingreso cancelado');
};
  
  const handleAddTaskToDay = useCallback((dayLabel: string) => {
  setEditingTask(null);
  setPrefillDayLabel(dayLabel);  // "Día 3"
  setIsModalOpen(true);
}, []);

  const handleKnowledgeSubmit = async (
    item: Omit<KnowledgeItem, 'id'> | KnowledgeItem,
    scope: 'individual' | 'team' = 'individual'
  ) => {
    const isEdit = 'id' in item;
    let finalItem = { ...item } as KnowledgeItem;

    if (view === 'leader') {
      if (scope === 'team') {
        finalItem.teamName = selectedTeam || currentProfile?.info?.teamName || '';
        delete (finalItem as any).profileId;
      } else {
        finalItem.profileId = currentProfileId;
        delete (finalItem as any).teamName;
      }
    }

    finalItem.isGlobal = view === 'admin';

    try {
      if (isApi) {
        // API mode
        const created = await DataService.createKnowledgeItem(finalItem);

        console.log('[created knowledge]', created);
        console.log('[leader context]', { view, currentProfileId, team: currentProfile?.info?.teamName, selectedTeam });

        setKnowledgeItems(prev => {
          const curr = prev ?? [];
          const idx = curr.findIndex(k => k.id === created.id);

          if (idx >= 0) {
            const copy = [...curr];
            copy[idx] = created;
            return copy;
          }

          return [...curr, created];
        });
      } else {
        // LOCAL mode (Vercel demo)
        const next = (() => {
          const curr = knowledgeItems ?? [];
          const idx = curr.findIndex(k => k.id === finalItem.id);
          if (idx >= 0) {
            const copy = [...curr];
            copy[idx] = finalItem;
            return copy;
          }
          return [...curr, finalItem];
        })();

        setKnowledgeItems(next);
        await DataService.saveKnowledgeItems(next);
      }

      setIsKnowledgeModalOpen(false);
      setEditingKnowledgeItem(null);
    } catch (e) {
      console.error(e);
      showToast('No se pudo guardar el recurso');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (!currentProfile) return;

    const tasks = currentProfile.tasks;
    const activeTaskIndex = tasks.findIndex(t => t.id === activeId);    
    if (activeTaskIndex === -1) return;

    const dragged = tasks[activeTaskIndex];
    if (view === 'leader' && dragged?.isGlobal) return;

    let nextTasks = [...tasks];
    const draggedTask = { ...nextTasks[activeTaskIndex] };

    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
        const overTaskIndex = tasks.findIndex(t => t.id === overId);
        draggedTask.day = overTask.day;
        draggedTask.week = overTask.week;
        nextTasks[activeTaskIndex] = draggedTask;
        
        if (activeId !== overId) {
            nextTasks = arrayMove(nextTasks, activeTaskIndex, overTaskIndex);
        }
    } 
    else if (DAYS.includes(overId)) {
        const dayNumber = Number(String(overId).replace('Día', '').trim()); // "Día 3" -> 3
        draggedTask.day = dayNumber;
        nextTasks[activeTaskIndex] = draggedTask;
    }
    else if (overId.startsWith('cal-')) {
        const dateStr = overId.replace('cal-', '');
        const [y, m, d] = dateStr.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d);
        const onboardingStart = getOnboardingStartDate(currentProfile.info);
        const { week, day } = getDayAndWeekFromDate(targetDate, onboardingStart);
        
        draggedTask.week = week;
        draggedTask.day = day;
        nextTasks[activeTaskIndex] = draggedTask;
    }

    const next = nextTasks.map(normalizeTask);
    updateCurrentProfile({ tasks: next });
    
  };

  const isTodayColumn = useCallback((dayLabel: string) => {
    const columnDate = getBoardColumnDate(dayLabel, selectedWeek);

    const today = new Date();
    // comparar solo fecha, sin hora
    today.setHours(0, 0, 0, 0);

    const col = new Date(columnDate);
    col.setHours(0, 0, 0, 0);

    return today.getTime() === col.getTime();
  }, [getBoardColumnDate, selectedWeek]);

  const visibleDays = !isMobile
    ? DAYS
    : mobileDayFilter === 'all'
      ? DAYS
      : DAYS.filter(day => day === mobileDayFilter);

  useEffect(() => {
    if (currentPage !== 'app') return;
    if (!currentProfile) return;

    const loginUserKey =
      view === 'leader'
        ? currentUser
        : view;

    const tourKey = `onboarding_tour_seen_${appMode}_${view}_${loginUserKey}`;

    if (localStorage.getItem(tourKey)) return;

    const t = setTimeout(() => {
      runAppTour({
        currentView: view,
        goToTab: (tab) => setDisplayMode(tab),
        appMode,
      });

      localStorage.setItem(tourKey, 'true');
    }, 600);

    return () => clearTimeout(t);
  }, [currentPage, currentProfile, appMode, view, currentUser]);

  if (currentPage === 'landing') {
    return <LandingPage onStartApp={handleStartApp} />;
  }

  if (!currentProfile) {
    return <div className="h-screen flex items-center justify-center font-bold text-brand-navy">Iniciando Navegador RH...</div>;
  }

  return (
    <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={(e) => setActiveTask(currentProfile.tasks.find(t => t.id === e.active.id) || null)} 
        onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-brand-light text-brand-navy font-sans flex flex-col">
        <Header 
          currentView={view} onViewChange={setView} onLogout={() => {              
              setCurrentPage('landing');
              sessionStorage.removeItem('startmap_session');
          }} 
          profiles={accessibleProfiles} currentProfileId={currentProfileId} onProfileChange={handleProfileChange}
          currentUser={currentUser} onUserSwitch={setCurrentUser}
          mode={appMode} isSyncing={isSyncing} onAddProfile={handleAddProfile} onDeleteProfile={handleDeleteProfile}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
        />
        
        <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto flex-1 w-full">
          <OnboardingInfoDisplay info={currentProfile.info} view={view} onEdit={() => {
              setProfileModalMode('edit');
              setDraftInfo(null);
              setIsInfoModalOpen(true);
              }} 
          />
          <ViewControls displayMode={displayMode} onDisplayModeChange={setDisplayMode} selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} currentView={view} />

          {displayMode === 'board' && (
            <div className="md:hidden mb-4">
              <div className="flex overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
                <div className="inline-flex min-w-max gap-2 bg-slate-200/50 p-1 rounded-lg">
                  <button
                    onClick={() => setMobileDayFilter('all')}
                    className={`shrink-0 whitespace-nowrap px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-200 ${
                      mobileDayFilter === 'all'
                        ? 'bg-brand-yellow text-brand-navy shadow-md border border-brand-yellow'
                        : 'text-slate-500 hover:bg-slate-300/30'
                    }`}
                  >
                    Todos
                  </button>

                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => setMobileDayFilter(day)}
                      className={`shrink-0 whitespace-nowrap px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-200 ${
                        mobileDayFilter === day
                          ? 'bg-brand-yellow text-brand-navy shadow-md border border-brand-yellow'
                          : 'text-slate-500 hover:bg-slate-300/30'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {displayMode === 'board' && (
            <>
              <FilterControls 
                taskTypeFilter={taskTypeFilter} 
                onTaskTypeFilterChange={setTaskTypeFilter} 
                completionStatusFilter={completionStatusFilter} 
                onCompletionStatusFilterChange={setCompletionStatusFilter} 
                onClearFilters={() => {
                  setTaskTypeFilter('all'); 
                  setCompletionStatusFilter('all');
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {visibleDays.map(day => {
                  const dayNumber = Number(String(day).replace('Día', '').trim()); // "Día 3" -> 3
                  const tasksForColumn = filteredTasks.filter(t => t.day === dayNumber);

                  return (
                   <div key={day}>
                      <SortableContext
                        items={tasksForColumn.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <DayColumn 
                          day={day} // seguís mostrando "Día 1" en UI, ok
                          formattedDate={formatDateForDayColumn(getBoardColumnDate(day, selectedWeek))} 
                          tasks={tasksForColumn} 
                          view={view}
                          knowledgeItems={filteredKnowledgeItems}
                          onboardingInfo={currentProfile.info}
                          isToday={isTodayColumn(day)}
                          onAddTaskToDay={handleAddTaskToDay} 
                          onEditTask={(t) => {
                            if (view === 'leader' && t.isGlobal) {
                              showToast('Las tareas institucionales no se editan desde la vista líder');
                              return;
                            }
                            setEditingTask(t);
                            setIsModalOpen(true);
                          }}
                          onDeleteTask={(id) => {
                            const t = currentProfile.tasks.find(x => x.id === id);

                            if (view === 'leader' && t?.isGlobal) {
                              showToast('Las tareas institucionales no se eliminan desde la vista líder');
                              return;
                            }
                            openConfirm(
                              "Eliminar tarea",
                              "¿Seguro que querés eliminar esta tarea? Esta acción no se puede deshacer.",
                              async () => {
                                const t = currentProfile.tasks.find(x => x.id === id);
                                const gId = t?.globalTaskId;

                                if (gId) {
                                  const nextProfiles = profiles.map(p => ({
                                    ...p,
                                    tasks: (p.tasks ?? []).filter(task => task.globalTaskId !== gId),
                                  }));
                                  await persistProfiles(nextProfiles); // guarda todos los perfiles (local o API)
                                } else {
                                  await updateCurrentProfile({
                                    tasks: (currentProfile.tasks ?? []).filter(task => task.id !== id),
                                  });
                                }

                                showToast("Tarea eliminada");
                              }
                            );
                          }}
                          onToggleComplete={(id) => {
                            const nextTasks = currentProfile.tasks.map(t =>
                              t.id === id
                                ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
                                : t
                            );

                            const updated = nextTasks.find(t => t.id === id);

                            updateCurrentProfile({
                              tasks: nextTasks.map(normalizeTask),
                            });

                            if (isApi && updated) {
                              DataService.patchTask(currentProfile.id, id, {
                                completed: updated.completed,
                                completedAt: updated.completedAt,
                              }).catch((e) => {
                                console.error(e);
                                showToast('No se pudo actualizar el estado de la tarea');
                              });
                            }
                          }}
                          onToggleSubtaskComplete={(tid, sid) => {
                            const nextTasks = currentProfile.tasks.map(t =>
                              t.id === tid
                                ? { ...t, subtasks: t.subtasks?.map(s => s.id === sid ? { ...s, completed: !s.completed } : s) }
                                : t
                            );

                            const updated = nextTasks.find(t => t.id === tid);

                            const next = nextTasks.map(normalizeTask);
                            updateCurrentProfile({ tasks: next });

                            if (isApi && updated) {
                              DataService.patchTask(currentProfile.id, tid, {
                                subtasks: updated.subtasks,
                              }).catch((e) => {
                                console.error(e);
                                showToast('No se pudo actualizar la subtarea');
                              });
                            }
                          }}
                        />
                      </SortableContext>
                    </div>
                  );
                })}
              </div>
            </>
          )}          
          {displayMode === 'calendar' && <CalendarView tasks={currentProfile.tasks} onboardingInfo={currentProfile.info} view={view} onSelectTask={openTaskDetail} />}
          {displayMode === 'repository' && (
            <RepositoryView
              items={filteredKnowledgeItems}
              view={view}
              onboardingInfo={currentProfile.info}
              onEdit={(ki) => {
                setEditingKnowledgeItem(ki);
                setIsKnowledgeModalOpen(true);
              }}
              onDelete={(id) => {
                openConfirm(
                  "Eliminar recurso",
                  "¿Seguro que querés eliminar este recurso? Esta acción no se puede deshacer.",
                  async () => {
                    await DataService.deleteKnowledgeItem(id);
                    setKnowledgeItems(prev => prev.filter(k => k.id !== id));
                    showToast("Recurso eliminado");
                  }
                );
              }}
            />
          )}
          {displayMode === 'analytics' && <AnalyticsView tasks={currentProfile.tasks} knowledgeItems={knowledgeItems} allProfiles={accessibleProfiles} view={view} onExport={() => DataService.exportToJSON(profiles, knowledgeItems)} />}
        </main>

      <footer className="bg-brand-navy text-white/60 py-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <BrandLogo 
              imgSrc={footerLogo}
              alt="Logo BA Desde Adentro"
              iconClassName="h-12 w-auto"
              withText={false}
              variant="light" 
            />
            
            <p className="text-xs max-w-xs text-center md:text-left leading-relaxed">
              Subsecretaría de Gestión de Recursos Humanos<br />
              Gobierno de la Ciudad de Buenos Aires
            </p>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Prueba Piloto 2026
          </div>

        </div>
      </footer>

        {(view === 'leader' || view === 'admin') && (
          <div className="fixed bottom-24 right-8 z-40">
            <button
                data-tour="app-fab-plus" 
                onClick={() => displayMode === 'repository' ? setIsKnowledgeModalOpen(true) : setIsModalOpen(true)}
                className="bg-brand-navy text-white rounded-full p-3 shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center"
                title="Agregar nueva tarea o recurso"
            >
                <PlusIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        )}

        <TaskFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
            setPrefillDayLabel(null);
          }}
          onSubmit={(t, scope = 'individual') => {
            const normalized = normalizeTask(t);

            // ===== EDITAR =====
            if (editingTask) {
              const gId = editingTask.globalTaskId ?? normalized.globalTaskId;

              if (gId && (editingTask.isGlobal || normalized.isGlobal)) {
                const nextProfiles = profiles.map((profile) => ({
                  ...profile,
                  tasks: (profile.tasks ?? []).map((task) =>
                    task.globalTaskId === gId
                      ? normalizeTask({
                          ...task,
                          ...normalized,
                          isGlobal: true,
                          globalTaskId: gId,
                        })
                      : task
                  ),
                }));

                persistProfiles(nextProfiles);
              } else {
                updateCurrentProfile({
                  tasks: (currentProfile.tasks ?? []).map((p) =>
                    p.id === editingTask.id ? normalizeTask({ ...editingTask, ...normalized }) : p
                  ),
                });
              }

              setIsModalOpen(false);
              setEditingTask(null);
              setPrefillDayLabel(null);
              showToast('Tarea guardada');
              return;
            }

            // ===== CREAR NUEVA: INSTITUCIONAL (admin) =====
            if (normalized.isGlobal) {
              const globalTaskId = `gt-${Date.now()}`;

              const nextProfiles = profiles.map((profile) => {
                const perProfileTask = normalizeTask({
                  ...normalized,
                  id: `t-${Date.now()}-${profile.id}`,
                  completed: false,
                  completedAt: undefined,
                  isGlobal: true,
                  globalTaskId,
                  createdInProfileId: profile.id,
                });

                return { ...profile, tasks: [...(profile.tasks ?? []), perProfileTask] };
              });

              persistProfiles(nextProfiles);

              setIsModalOpen(false);
              setPrefillDayLabel(null);
              showToast('Tarea institucional creada');
              return;
            }

            // ===== CREAR NUEVA: MASIVA POR EQUIPO (leader) =====
            if (view === 'leader' && scope === 'team') {
              const norm = (s?: string) => (s ?? '').trim().toLowerCase();
              const leaderTeamKey = norm(currentProfile?.info?.teamName);

              if (!leaderTeamKey) {
                showToast('Este perfil no tiene equipo asignado');
                return;
              }

              const targets = accessibleProfiles.filter(p => norm(p.info?.teamName) === leaderTeamKey);
              const baseTs = Date.now();

              const nextProfiles = profiles.map(profile => {
                const isTarget = targets.some(t => t.id === profile.id);
                if (!isTarget) return profile;

                const perProfileTask = normalizeTask({
                  ...normalized,
                  id: `t-${baseTs}-${profile.id}`,
                  completed: false,
                  completedAt: undefined,
                  isGlobal: false,
                  globalTaskId: undefined,
                  createdInProfileId: profile.id,
                });

                return { ...profile, tasks: [...(profile.tasks ?? []), perProfileTask] };
              });

              persistProfiles(nextProfiles);

              setIsModalOpen(false);
              setPrefillDayLabel(null);
              showToast(`Tarea creada para ${targets.length} integrante(s) del equipo`);
              return;
            }

            // ===== CREAR NUEVA: INDIVIDUAL =====
            updateCurrentProfile({
              tasks: [
                ...(currentProfile.tasks ?? []),
                normalizeTask({ ...normalized, id: `t-${Date.now()}`, completed: false, createdInProfileId: currentProfileId, }),
              ],
            });

            setIsModalOpen(false);
            setPrefillDayLabel(null);
            showToast('Tarea guardada');
          }}
          taskData={editingTask}
          selectedWeek={selectedWeek}
          knowledgeItems={filteredKnowledgeItems}
          initialDay={prefillDayLabel ?? undefined}
          view={view}
          teamName={currentProfile?.info?.teamName || 'Sin Equipo'}
          currentProfileId={currentProfileId} 
        />

        <TaskDetailModal isOpen={isTaskDetailOpen} onClose={closeTaskDetail} task={selectedTask} knowledgeItems={knowledgeItems} />
        <KnowledgeItemFormModal
          isOpen={isKnowledgeModalOpen}
          onClose={() => {
            setIsKnowledgeModalOpen(false);
            setEditingKnowledgeItem(null);
          }}
          onSubmit={handleKnowledgeSubmit}
          itemData={editingKnowledgeItem}
          view={view}
          currentProfileId={currentProfileId}
          currentTeamName={selectedTeam || currentProfile?.info?.teamName || ''}
        />
        <OnboardingInfoFormModal
          key={`${profileModalMode}-${profileModalMode === 'create' ? 'new' : currentProfileId}`}
          isOpen={isInfoModalOpen}
          onClose={() => {
            setIsInfoModalOpen(false);
            setDraftInfo(null);
            setProfileModalMode('edit');
          }}
          infoData={
            profileModalMode === 'create'
              ? (draftInfo ?? buildEmptyInfo())
              : (currentProfile?.info ?? buildEmptyInfo())
          }
          profileId={
            profileModalMode === 'create'
              ? ''
              : (currentProfile?.id ?? '')
          }
          onSubmit={async (i) => {
            console.log('[submit modal]', profileModalMode, i);

            const cleanProfileId = i.profileId?.trim() ?? '';
            const cleanManagerId = i.managerId?.trim() ?? '';

            const isValid =
              cleanProfileId !== '' &&
              i.newHireName.trim() !== '' &&
              i.jobTitle.trim() !== '' &&
              (i.onboardingStartDate ?? '').trim() !== '';

            if (!isValid) {
              showToast('Por favor, completa los campos obligatorios.');
              return;
            }

            /**
             * CREACIÓN DE INGRESANTE
             */
            if (profileModalMode === 'create') {
              console.log('[CREATE] entro al bloque create');

              const newId = cleanProfileId || `profile-${Date.now()}`;

              const duplicatedId = profiles.some(profile => profile.id === newId);

              if (duplicatedId) {
                showToast('Ya existe un ingresante con ese CUIL/ID.');
                return;
              }

              console.log('[CREATE] newId', newId);

              const seededTasks = defaultTasks.map(task =>
                normalizeTask({
                  ...task,
                  completed: false,
                  completedAt: undefined,
                  createdInProfileId: newId,
                })
              );

              console.log('[CREATE] seededTasks', seededTasks.length);

              const newProfile: OnboardingProfile = {
                id: newId,
                status: 'active',
                info: {
                  ...i,
                  profileId: newId,
                  managerId: cleanManagerId,
                },
                tasks: seededTasks,
                documents: [],
              };

              console.log('[CREATE] newProfile', newProfile);

              const nextProfiles = [...profiles, newProfile];

              try {
                await DataService.createProfile(newProfile);

                setProfiles(nextProfiles);
                setCurrentProfileId(newId);
                setSelectedTeam(newProfile.info.teamName);
                setIsInfoModalOpen(false);
                setDraftInfo(null);
                setProfileModalMode('edit');

                showToast('Ingresante agregado');
              } catch (e) {
                console.error('[CREATE] error', e);
                showToast('No se pudo guardar el ingresante');
              }

              return;
            }

            /**
             * EDICIÓN DE INGRESANTE
             *
             * Importante:
             * Usamos originalId para encontrar el perfil anterior.
             * No usamos updatedId para buscar, porque si se corrigió el CUIL,
             * el perfil viejo todavía tiene el ID anterior.
             */
            const originalId = currentProfile?.id ?? currentProfileId;
            const updatedId = cleanProfileId || originalId;

            const foundOriginalProfile = profiles.some(profile => profile.id === originalId);

            if (!foundOriginalProfile) {
              console.error('[EDIT] No se encontró el perfil original', {
                originalId,
                updatedId,
                currentProfileId,
                currentProfile,
              });

              showToast('No se encontró el perfil a actualizar.');
              return;
            }

            const duplicatedId = profiles.some(profile =>
              profile.id === updatedId && profile.id !== originalId
            );

            if (duplicatedId) {
              showToast('Ya existe un ingresante con ese CUIL/ID.');
              return;
            }

            const nextProfiles = profiles.map(profile =>
              profile.id === originalId
                ? {
                    ...profile,
                    id: updatedId,
                    info: {
                      ...i,
                      profileId: updatedId,
                      managerId: cleanManagerId,
                    },
                  }
                : profile
            );

            try {
              await DataService.saveProfiles(nextProfiles);

              setProfiles(nextProfiles);
              setCurrentProfileId(updatedId);
              setSelectedTeam(i.teamName);
              setIsInfoModalOpen(false);
              setDraftInfo(null);
              setProfileModalMode('edit');

              showToast('Info actualizada');
            } catch (e) {
              console.error('[EDIT] error', e);
              showToast('No se pudo actualizar la información');
            }
          }}
        />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} view={view} isOverlay knowledgeItems={filteredKnowledgeItems} onboardingInfo={currentProfile.info} /> : null}</DragOverlay>
        {view === 'newHire' ? <Chatbot profile={currentProfile} /> : <LeaderChatbot showPlusButton={true} />}
      
        <ConfirmationModal
          isOpen={confirmOpen}
          onClose={closeConfirm}
          onConfirm={async () => {
            try {
              await pendingAction?.();
            } catch (e) {
              console.error(e);
              alert("No se pudo completar la acción.");
            } finally {
              closeConfirm();
            }
          }}
          title={confirmTitle}
          message={confirmMessage}
        />
      </div>
    </DndContext>
  );
};

export default App;
