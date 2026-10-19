
import React, { useState, useMemo, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskType, TASK_TYPE_LABEL, OnboardingInfo, View } from '../types';
import { getOnboardingStartDate, getTaskDate } from '../utils/date';
import { ChevronLeftIcon, ChevronRightIcon, TinyHomeIcon, TinyBuildingIcon, MeetingIcon, SetupIcon, ReadingIcon, OperationalIcon } from './Icons';

interface CalendarViewProps {
  tasks: Task[];
  onboardingInfo: OnboardingInfo;
  view: View;
  onSelectTask: (task: Task) => void;
}

const TASK_TYPE_COLORS: { [key in TaskType]: string } = {
  [TaskType.MEETING]: 'bg-sky-500',
  [TaskType.SETUP]: 'bg-amber-500',
  [TaskType.READING]: 'bg-emerald-500',
  [TaskType.OPERATIONAL]: 'bg-violet-500',
};

const TASK_TYPE_ICON: Record<TaskType, React.ReactNode> = {
  [TaskType.MEETING]: <MeetingIcon />,
  [TaskType.SETUP]: <SetupIcon />,
  [TaskType.READING]: <ReadingIcon />,
  [TaskType.OPERATIONAL]: <OperationalIcon />,
};

const spanishDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Component for a single Draggable Task inside the Calendar
const CalendarTaskItem: React.FC<{ task: Task; view: View; onSelect: (task: Task) => void }> = ({ task, view, onSelect }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, disabled: view === 'newHire' });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
              onClick={(e) => {
               // evita abrir detalle cuando estás arrastrando
               if (isDragging) return;
                e.stopPropagation();
                onSelect(task);
              }}
            className={`w-full text-left text-[10px] text-white px-2 py-0.5 rounded flex items-center gap-1 shadow-sm ${TASK_TYPE_COLORS[task.type]} hover:brightness-110 transition-all cursor-grab active:cursor-grabbing`}
            title={`${task.type} • ${task.title}`}
        >
            {TASK_TYPE_ICON[task.type]}
            <span className="truncate flex-1">{task.title}</span>
        </div>
    );
};

// Component for each Day Cell in the Calendar (Droppable)
const CalendarDayCell: React.FC<{ 
    day: number, 
    date: Date, 
    tasks: Task[], 
    isToday: boolean, 
    onboardingInfo: OnboardingInfo,
    view: View 
    onSelectTask: (task: Task) => void;
}> = ({ day, date, tasks, isToday, onboardingInfo, view, onSelectTask }) => {
    
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const { setNodeRef, isOver } = useDroppable({
        id: `cal-${dateStr}`,
    });

    const dayOfWeek = date.getDay();
    let dayIcon: React.ReactNode = null;
    
    if (onboardingInfo.remoteWorkDay && onboardingInfo.remoteWorkDay !== 'Ninguno') {
        const dayName = spanishDays[dayOfWeek];
        if (dayOfWeek > 0 && dayOfWeek < 6) { // Weekdays: Monday to Friday
            if (dayName === onboardingInfo.remoteWorkDay) {
                dayIcon = <TinyHomeIcon />;
            } else {
                dayIcon = <TinyBuildingIcon />;
            }
        }
    }

    return (
        <div 
            ref={setNodeRef}
            className={`border-r border-b border-slate-200 p-2 min-h-[120px] flex flex-col transition-colors duration-200 ${isOver ? 'bg-brand-cyan/10' : ''}`}
        >
            <div className="flex justify-between items-center mb-1">
                <div className={`font-bold text-xs ${isToday ? 'bg-brand-cyan text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-slate-500'}`}>
                    {day}
                </div>
                {dayIcon && <div className="text-slate-300" title={spanishDays[dayOfWeek] === onboardingInfo.remoteWorkDay ? 'Trabajo Remoto' : 'Trabajo Presencial'}>{dayIcon}</div>}
            </div>
            
            <div className="space-y-1 flex-grow overflow-y-auto custom-scrollbar pr-0.5">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <CalendarTaskItem key={task.id} task={task} view={view} onSelect={onSelectTask} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onboardingInfo, view, onSelectTask }) => {
  const onboardingStartDate = useMemo(
    () => getOnboardingStartDate(onboardingInfo),
    [onboardingInfo.onboardingStartDate]
  );

  // el calendario arranca mirando el mes del ingreso
  const [currentDate, setCurrentDate] = useState(onboardingStartDate);

  // si cambia el ingreso (o el perfil), movemos el calendario a ese mes
  useEffect(() => {
    setCurrentDate(onboardingStartDate);
  }, [onboardingStartDate]);

  const tasksWithDates = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      date: getTaskDate(task, onboardingStartDate),
    }));
  }, [tasks, onboardingStartDate]);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday is 0
  const daysInMonth = lastDayOfMonth.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const getTasksForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return tasksWithDates.filter(task => {
        const taskDate = task.date;
        return taskDate.getFullYear() === date.getFullYear() &&
               taskDate.getMonth() === date.getMonth() &&
               taskDate.getDate() === date.getDate();
    });
  };

  const calendarGrid = [];
  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarGrid.push(<div key={`empty-start-${i}`} className="border-r border-b border-slate-200 bg-slate-50/30"></div>);
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const tasksForDay = getTasksForDay(day);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isToday = new Date().toDateString() === date.toDateString();
    
    calendarGrid.push(
      <CalendarDayCell 
        key={day}
        day={day}
        date={date}
        tasks={tasksForDay}
        isToday={isToday}
        onboardingInfo={onboardingInfo}
        view={view}
        onSelectTask={onSelectTask}
      />
    );
  }

  // Add empty cells to complete the grid
  const totalCells = startingDayOfWeek + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    calendarGrid.push(<div key={`empty-end-${i}`} className="border-r border-b border-slate-200 bg-slate-50/30"></div>);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 animate-fade-in-down">
      <div className="flex justify-between items-center mb-6 px-2">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-brand-navy transition-colors border border-slate-200">
            <ChevronLeftIcon />
        </button>
        <div className="text-center">
            <h2 className="text-xl font-black text-brand-navy font-heading uppercase tracking-tight">
              {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Arrastra tareas para cambiar fechas</p>
        </div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-brand-navy transition-colors border border-slate-200">
            <ChevronRightIcon />
        </button>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-slate-200 rounded-lg overflow-hidden">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="text-center font-black text-[10px] text-slate-400 py-3 border-r border-b border-slate-200 bg-slate-50 font-heading uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
        {calendarGrid}
      </div>
    </div>
  );
};
