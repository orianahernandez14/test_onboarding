import React from 'react';
import { BoardIcon, CalendarViewIcon, KnowledgeBookIcon, AnalyticsIcon } from './Icons';
import { DisplayMode, View } from '../types';

interface ViewControlsProps {
    displayMode: DisplayMode;
    onDisplayModeChange: (mode: DisplayMode) => void;
    selectedWeek: number;
    onWeekChange: (week: number) => void;
    currentView: View;
}

const WEEKS = [1, 2, 3, 4];

export const ViewControls: React.FC<ViewControlsProps> = React.memo(({ displayMode, onDisplayModeChange, selectedWeek, onWeekChange, currentView }) => {
    
    return (
        <div className="my-6">
            <div className="mb-6">
                <div className="flex overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] md:justify-center">
                    <div className="inline-flex min-w-max rounded-lg shadow-sm bg-white p-1 border border-slate-200">
                        <button
                            data-tour="app-tab-tablero"
                            onClick={() => onDisplayModeChange('board')}
                            className={`shrink-0 whitespace-nowrap px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all duration-200 ${displayMode === 'board' ? 'bg-brand-yellow text-brand-navy shadow-sm border border-brand-yellow' : 'text-slate-500 hover:text-brand-navy'}`}
                            aria-pressed={displayMode === 'board'}
                        >
                            <BoardIcon />
                            Tablero
                        </button>
                        <button
                            data-tour="app-tab-calendario"
                            onClick={() => onDisplayModeChange('calendar')}
                            className={`shrink-0 whitespace-nowrap px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all duration-200 ${displayMode === 'calendar' ? 'bg-brand-yellow text-brand-navy shadow-sm border border-brand-yellow' : 'text-slate-500 hover:text-brand-navy'}`}
                            aria-pressed={displayMode === 'calendar'}
                        >
                            <CalendarViewIcon />
                            Calendario
                        </button>
                        <button
                            data-tour="app-tab-repositorio"
                            onClick={() => onDisplayModeChange('repository')}
                            className={`shrink-0 whitespace-nowrap px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all duration-200 ${displayMode === 'repository' ? 'bg-brand-yellow text-brand-navy shadow-sm border border-brand-yellow' : 'text-slate-500 hover:text-brand-navy'}`}
                            aria-pressed={displayMode === 'repository'}
                        >
                            <KnowledgeBookIcon />
                            Repositorio
                        </button>
                        {(currentView === 'admin' || currentView === 'leader') && (
                            <button
                                data-tour="app-tab-metricas"
                                onClick={() => onDisplayModeChange('analytics')}
                                className={`shrink-0 whitespace-nowrap px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all duration-200 ${displayMode === 'analytics' ? 'bg-brand-yellow text-brand-navy shadow-sm border border-brand-yellow' : 'text-slate-500 hover:text-brand-navy'}`}
                                aria-pressed={displayMode === 'analytics'}
                            >
                                <AnalyticsIcon />
                                Métricas
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {displayMode === 'board' && (
                <div className="flex overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] md:justify-center">
                    <div className="inline-flex min-w-max gap-2 bg-slate-200/50 p-1 rounded-lg">
                        {WEEKS.map(week => (
                            <button
                                key={week}
                                onClick={() => onWeekChange(week)}
                                className={`shrink-0 whitespace-nowrap px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-200 ${selectedWeek === week ? 'bg-brand-yellow text-brand-navy shadow-md border border-brand-yellow' : 'text-slate-500 hover:bg-slate-300/30'}`}
                                aria-pressed={selectedWeek === week}
                            >
                                Semana {week}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});