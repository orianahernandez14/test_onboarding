
import React, { useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Task, KnowledgeItem, OnboardingProfile, View } from '../types';
import { AnalyticsIcon, CheckCircleIcon, TeamIcon, UserIcon, BuildingIcon, DownloadIcon } from './Icons';

interface AnalyticsViewProps {
  tasks: Task[]; 
  knowledgeItems: KnowledgeItem[];
  allProfiles: OnboardingProfile[];
  view: View;
  onExport?: () => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color?: string; bgColor?: string }> = React.memo(({ title, value, icon, color = "text-brand-cyan", bgColor = "bg-white" }) => (
  <div className={`${bgColor} p-6 rounded-lg shadow-sm border border-slate-200 flex items-center transition-transform hover:scale-[1.02]`}>
    <div className={`flex-shrink-0 ${color}`}>{icon}</div>
    <div className="ml-4">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-tighter">{title}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  </div>
));

const OrganizationMapCard: React.FC<{ profile: OnboardingProfile }> = ({ profile }) => {
    const totalTasks = profile.tasks.length;
    const completedTasks = profile.tasks.filter(t => t.completed).length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{profile.info.newHireName}</h4>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter truncate">{profile.info.jobTitle}</p>
                </div>
                <div className="ml-2 bg-brand-cyan text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-cyan whitespace-nowrap">
                    TEAM: {profile.info.teamName}
                </div>
            </div>
            
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500">Plan de Integración Cultural</span>
                        <span className="font-bold text-slate-700">{taskProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand-cyan h-1.5 rounded-full transition-all duration-1000" style={{ width: `${taskProgress}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ knowledgeItems, allProfiles, view, onExport }) => {
  const uniqueProfiles = useMemo(() => {
    const map = new Map<string, OnboardingProfile>();

    allProfiles.forEach(profile => {
        map.set(profile.id, profile);
    });

    return Array.from(map.values());
  }, [allProfiles]);
  
  const isAdmin = view === 'admin';
  const isLeader = view === 'leader';

  const { globalAvg, totalIngresantes, totalKnowledge } = useMemo(() => {
    let totalPct = 0;
    let count = 0;

    uniqueProfiles.forEach(p => {
        const tasksCount = p.tasks.length;
        if (tasksCount > 0) {
        totalPct += (p.tasks.filter(t => t.completed).length / tasksCount);
        count++;
        }
    });

    const isGlobalItem = (ki: KnowledgeItem) => ki.isGlobal === true;

    // Admin: todos los recursos
    if (isAdmin) {
        return {
        globalAvg: count > 0 ? Math.round((totalPct / count) * 100) : 0,
        totalIngresantes: uniqueProfiles.length,
        totalKnowledge: knowledgeItems.length,
        };
    }

    // Leader: globales + recursos vinculados a los perfiles que ve (mis ingresantes)
    const visibleProfileIds = new Set(uniqueProfiles.map(p => p.id));

    const visibleKnowledgeCount = knowledgeItems.filter(ki => {
        if (isGlobalItem(ki)) return true;
        if (ki.profileId && visibleProfileIds.has(ki.profileId)) return true;
        return false;
    }).length;

    return {
        globalAvg: count > 0 ? Math.round((totalPct / count) * 100) : 0,
        totalIngresantes: uniqueProfiles.length,
        totalKnowledge: visibleKnowledgeCount,
    };
    }, [uniqueProfiles, knowledgeItems, isAdmin]);

  const teamStats = useMemo(() => {
    const groups: Record<string, { profiles: OnboardingProfile[], avg: number }> = {};
    uniqueProfiles.forEach(p => {
        const team = p.info.teamName || 'Sin Equipo';
        if (!groups[team]) groups[team] = { profiles: [], avg: 0 };
        groups[team].profiles.push(p);
    });
    Object.keys(groups).forEach(team => {
        let teamTotalPct = 0;
        let teamCount = 0;
        groups[team].profiles.forEach(p => {
            if (p.tasks.length > 0) {
                teamTotalPct += (p.tasks.filter(t => t.completed).length / p.tasks.length);
                teamCount++;
            }
        });
        groups[team].avg = teamCount > 0 ? Math.round((teamTotalPct / teamCount) * 100) : 0;
    });
    return groups;
  }, [uniqueProfiles]);

  const adminGroups = useMemo(() => {
    const teams: Record<string, Record<string, OnboardingProfile[]>> = {};
    uniqueProfiles.forEach(p => {
        const team = p.info.teamName || 'Sin Equipo';
        const leader = p.info.manager || 'Sin Líder';
        if (!teams[team]) teams[team] = {};
        if (!teams[team][leader]) teams[team][leader] = [];
        teams[team][leader].push(p);
    });
    return teams;
  }, [uniqueProfiles]);

const handleExportMetrics = () => {
  const metricsData = uniqueProfiles.map(profile => {
    const totalTasks = profile.tasks.length;
    const completedTasks = profile.tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const progress =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    return {
      Ingresante: profile.info.newHireName,
      Puesto: profile.info.jobTitle,
      Equipo: profile.info.teamName,
      Lider: profile.info.manager,
      'Fecha de inicio': profile.info.onboardingStartDate,
      'Total tareas': totalTasks,
      'Tareas completadas': completedTasks,
      'Tareas pendientes': pendingTasks,
      'Avance (%)': progress,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(metricsData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Metricas');

  XLSX.writeFile(workbook, 'metricas_onboarding.xlsx');
};

  return (
    <div className="space-y-8 animate-fade-in-down pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 font-heading flex items-center gap-3">
            <AnalyticsIcon className="w-8 h-8 text-brand-cyan" />
            {isAdmin ? 'Métricas de la Prueba Piloto' : 'Avance de mi Equipo'}
        </h2>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <button onClick={handleExportMetrics} className="flex items-center gap-2 text-[11px] font-bold text-brand-cyan hover:bg-brand-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-cyan px-3 py-1.5 rounded-lg transition-colors">
                <DownloadIcon className="w-4 h-4" /> EXPORTAR MÉTRICAS
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Participantes" value={totalIngresantes.toString()} icon={<TeamIcon className="w-8 h-8"/>} bgColor="bg-brand-yellow/10" color="text-brand-navy" />
        <StatCard title="Avance de Integración" value={`${globalAvg}%`} icon={<CheckCircleIcon className="w-8 h-8"/>} color="text-emerald-500" />
        <StatCard title="Recursos Disponibles" value={totalKnowledge.toString()} icon={<BuildingIcon className="w-8 h-8"/>} color="text-brand-cyan" />
      </div>

      {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Avance por Equipo Piloto</h3>
                  {(Object.entries(teamStats) as [string, { profiles: OnboardingProfile[], avg: number }][]).map(([team, stats]) => (
                      <div key={team} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-slate-700">{team}</span>
                              <span className="text-xs font-black text-brand-cyan">{stats.avg}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-brand-cyan h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.avg}%` }} />
                          </div>
                      </div>
                  ))}
              </div>

              <div className="lg:col-span-3 space-y-10">
                  <h3 className="text-lg font-bold text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-brand-cyan" />
                      Estado Detallado de Integración
                  </h3>
                  
                  {(Object.entries(adminGroups) as [string, Record<string, OnboardingProfile[]>][]).map(([teamName, leaders]) => (
                      <div key={teamName} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                          <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-3">
                                  <div className="bg-white p-2 rounded-lg shadow-sm"><TeamIcon className="text-brand-cyan" /></div>
                                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{teamName}</h4>
                              </div>
                              <div className="bg-brand-cyan text-white px-3 py-1 rounded-full text-xs font-bold">PROM: {teamStats[teamName]?.avg}%</div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {(Object.entries(leaders) as [string, OnboardingProfile[]][]).map(([leaderName, profiles]) => (
                                  <div key={leaderName} className="bg-white/50 p-4 rounded-xl border border-slate-200/60">
                                      <div className="flex items-center gap-2 text-slate-600 mb-4 border-b border-slate-200 pb-2">
                                          <UserIcon className="w-4 h-4 text-slate-400" />
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Líder: {leaderName}</span>
                                      </div>
                                      <div className="grid grid-cols-1 gap-4">
                                          {profiles.map(p => <OrganizationMapCard key={p.id} profile={p} />)}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {isLeader && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2"><TeamIcon className="w-5 h-5 text-brand-cyan" />Seguimiento de mis Ingresantes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{uniqueProfiles.map(p => <OrganizationMapCard key={p.id} profile={p} />)}</div>
          </div>
      )}
    </div>
  );
};
