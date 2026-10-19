
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task, View, KnowledgeItem, OnboardingInfo } from '../types';
import { TaskCard } from './TaskCard';
import { PlusIcon } from './Icons';

interface DayColumnProps {
  day: string;
  tasks: Task[];
  view: View;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  formattedDate: string;
  isToday?: boolean;
  onAddTaskToDay: (day: string) => void;
  knowledgeItems: KnowledgeItem[];
  onboardingInfo: OnboardingInfo;
}

export const DayColumn: React.FC<DayColumnProps> = React.memo(({ 
    day, tasks, view, knowledgeItems, onboardingInfo, onEditTask, onDeleteTask, onToggleComplete, onToggleSubtaskComplete, formattedDate, isToday, onAddTaskToDay
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: day,
    });

  return (
    <div
      ref={setNodeRef}
      className={`relative bg-slate-200/70 rounded-lg p-4 transition-all duration-200 flex flex-col ${isOver ? 'bg-brand-cyan/10' : ''} ${isToday ? 'border-t-4 border-t-brand-yellow shadow-md bg-white/80' : ''}`}
    >
      {isToday && (
          <div className="absolute -top-3.5 left-4 bg-brand-yellow text-brand-navy text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
              HOY
          </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <h2 className="font-bold text-lg text-slate-700 tracking-wide flex flex-col gap-0.5 font-heading">
          <span>{day}</span>
          <span className={`font-normal text-[11px] font-sans uppercase tracking-tight ${isToday ? 'text-brand-navy font-bold' : 'text-slate-500'}`}>
            {formattedDate}
          </span>
        </h2>
         {(view === 'leader' || view === 'admin') && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onAddTaskToDay(day)}
            className="p-1.5 rounded-md bg-white/10 text-brand-grey border border-brand-grey/30 shadow-sm hover:bg-white/20 hover:border-brand-grey hover:shadow transition-all active:scale-95"
            title={`Agregar tarea al ${day}`}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-3 min-h-[200px] flex-1">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            view={view}
            knowledgeItems={knowledgeItems}
            onboardingInfo={onboardingInfo}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onToggleComplete={onToggleComplete}
            onToggleSubtaskComplete={onToggleSubtaskComplete}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm border-2 border-dashed border-slate-300 rounded-lg">
            No hay tareas.
          </div>
        )}
      </div>
    </div>
  );
});
