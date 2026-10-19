import React, { useMemo, useEffect } from 'react';
import type { View, OnboardingProfile, AppMode } from '../types';
import { BrandLogo } from './BrandLogo';
import { UserIcon, PlusIcon, DeleteIcon } from './Icons';
import logo from '../assets/logo.png';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  profiles: OnboardingProfile[];
  currentProfileId: string;
  onProfileChange: (id: string) => void;
  currentUser: string;
  onUserSwitch: (userName: string) => void;
  mode: AppMode;
  isSyncing?: boolean;
  onAddProfile?: () => void;
  onDeleteProfile: (profileId: string) => void;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
}

const viewConfig = {
  newHire: { label: 'Ingresante', next: 'leader' as View },
  leader: { label: 'Líder', next: 'admin' as View },
  admin: { label: 'Administrador', next: 'newHire' as View },
};

export const Header: React.FC<HeaderProps> = React.memo(({
  currentView,
  onViewChange,
  onLogout,
  profiles,
  currentProfileId,
  onProfileChange,
  mode,
  isSyncing,
  onAddProfile,
  onDeleteProfile,
  selectedTeam,
  setSelectedTeam
}) => {

  const isDemo = mode === 'demo';

  const normalizeTeam = (t?: string) => (t || 'Sin Equipo').trim();

  const currentProfile = useMemo(
    () => profiles.find(p => p.id === currentProfileId) ?? null,
    [profiles, currentProfileId]
  );

  // Inicializa selectedTeam si está vacío
  useEffect(() => {
    if (selectedTeam) return;
    const team = normalizeTeam(currentProfile?.info.teamName);
    setSelectedTeam(team);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, currentProfile?.info?.teamName]);

  const teams = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach(p => set.add(normalizeTeam(p.info.teamName)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [profiles]);

  const teamProfiles = useMemo(() => {
    const t = normalizeTeam(selectedTeam);

    const filtered = profiles
      .filter(
        p => normalizeTeam(p.info.teamName) === t
      )
      .sort((a, b) =>
        a.info.newHireName.localeCompare(
          b.info.newHireName,
          'es'
        )
      );

    if (filtered.length > 0) {
      return filtered;
    }

    return [...profiles].sort((a, b) =>
      a.info.newHireName.localeCompare(
        b.info.newHireName,
        'es'
      )
    );
  }, [profiles, selectedTeam]);

  const handleTeamChange = (team: string) => {
    const t = normalizeTeam(team);
    setSelectedTeam(t);

    const first = profiles.find(p => normalizeTeam(p.info.teamName) === t);
    if (first && first.id !== currentProfileId) {
      onProfileChange(first.id);
    }
  };

  const handleProfileChange = (id: string) => {
    onProfileChange(id);

    const p = profiles.find(x => x.id === id);
    if (p) {
      const t = normalizeTeam(p.info.teamName);
      if (t !== selectedTeam) {
        setSelectedTeam(t);
      }
    }
  };

  return (
    <header className="bg-brand-navy shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto py-2 px-3 sm:px-6 flex flex-col gap-2 md:flex-row md:justify-between md:items-center">

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-6">
          <BrandLogo
            imgSrc={logo}
            alt="Logo RH"
            iconClassName="h-10 sm:h-12 md:h-16 w-auto"
            withText={false}
            variant="light"
          />

          {(currentView === 'admin' || currentView === 'leader') && (
            <div className="flex w-full flex-col gap-1.5 border-t pt-2 md:w-auto md:flex-row md:items-center md:gap-3 md:border-t-0 md:border-l md:pt-0 md:pl-4 border-white/20">
              <div className="flex w-full flex-col gap-1">
                <span className="text-[9px] font-black uppercase leading-none text-brand-yellow">
                  Selección: Equipo / Ingresante
                </span>

                <div
                  data-tour="app-selector-perfil"
                  className="flex w-full flex-col gap-2 md:flex-row md:items-center"
                >
                  {/* Equipo */}
                  <select
                    value={selectedTeam}
                    onChange={(e) => handleTeamChange(e.target.value)}
                    className="min-w-0 w-full md:min-w-[180px] md:flex-1 text-sm font-bold text-white bg-white/10 border-none rounded-lg focus:ring-1 focus:ring-brand-cyan cursor-pointer py-1.5 px-2"
                  >
                    {teams.map(team => (
                      <option key={team} value={team} className="text-brand-navy">
                        {team}
                      </option>
                    ))}
                  </select>

                  {/* Ingresante + botones */}
                    <div className="flex w-full items-center gap-2 md:w-auto">
                      <select
                        value={currentProfileId}
                        onChange={(e) => handleProfileChange(e.target.value)}
                        className="min-w-0 flex-1 md:w-[220px] text-sm font-bold text-white bg-white/10 border-none rounded-lg focus:ring-1 focus:ring-brand-cyan cursor-pointer py-1.5 pl-2 pr-8"
                      >
                        {teamProfiles.map(p => (
                          <option key={p.id} value={p.id} className="text-brand-navy">
                            {p.info.newHireName}
                          </option>
                        ))}
                      </select>

                      {currentView === 'admin' && (
                        <>
                          <button
                            onClick={onAddProfile}
                            className="shrink-0 p-2 bg-white/10 text-cyan-300 rounded-lg hover:bg-white/20 transition-colors border border-cyan-300/30"
                            title="Añadir nuevo ingresante"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteProfile(currentProfileId)}
                            className="shrink-0 p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400/10"
                            title="Cancelar ingreso"
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full items-center justify-between gap-2 pt-0.5 md:w-auto md:flex-wrap md:justify-end md:gap-6 md:pt-0">

          <div className="flex items-center gap-2">
            {isSyncing ? (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase hidden md:block text-white/70">
                  Sincronizando
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-[10px] font-bold uppercase hidden md:block text-emerald-400">
                  En línea
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wide ${isDemo ? 'bg-cyan-300/15 border-cyan-300/40 text-cyan-200' : 'bg-white/5 border-white/10 text-white/50'}`}>
              {viewConfig[currentView].label}
            </div>
            {isDemo && (
              <button
                data-tour="app-cambiar-vista"
                onClick={() => onViewChange(viewConfig[currentView].next)}
                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={onLogout}
            className="text-xs font-bold text-white/60 hover:text-red-400 uppercase transition-colors"
          >
            Salir
          </button>

        </div>
      </div>
    </header>
  );
});