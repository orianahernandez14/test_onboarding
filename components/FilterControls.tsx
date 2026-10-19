
import React from 'react';
import { TaskType, TASK_TYPE_LABEL } from '../types';

interface FilterControlsProps {
  taskTypeFilter: TaskType | 'all';
  onTaskTypeFilterChange: (type: TaskType | 'all') => void;
  completionStatusFilter: 'all' | 'completed' | 'incomplete';
  onCompletionStatusFilterChange: (status: 'all' | 'completed' | 'incomplete') => void;
  onClearFilters: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = React.memo(({
  taskTypeFilter,
  onTaskTypeFilterChange,
  completionStatusFilter,
  onCompletionStatusFilterChange,
  onClearFilters
}) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
                <label htmlFor="task-type-filter" className="block text-sm font-medium text-slate-700 mb-1 sm:mb-0 sm:mr-2">
                    Filtrar por tipo:
                </label>
                <select
                    id="task-type-filter"
                    value={taskTypeFilter}
                    onChange={(e) => onTaskTypeFilterChange(e.target.value as TaskType | 'all')}
                    className="block w-full sm:w-56 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="all">Todos los tipos</option>
                    {Object.values(TaskType).map(t => <option key={t} value={t}>{TASK_TYPE_LABEL[t]}</option>)}
                </select>
            </div>
            <div className="w-full sm:w-auto">
                <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-1 sm:mb-0 sm:mr-2">
                    Filtrar por estado:
                </label>
                <select
                    id="status-filter"
                    value={completionStatusFilter}
                    onChange={(e) => onCompletionStatusFilterChange(e.target.value as 'all' | 'completed' | 'incomplete')}
                    className="block w-full sm:w-56 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="all">Todos los estados</option>
                    <option value="completed">Completadas</option>
                    <option value="incomplete">Incompletas</option>
                </select>
            </div>
        </div>
        <button
            onClick={onClearFilters}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            Limpiar Filtros
        </button>
    </div>
  );
});
