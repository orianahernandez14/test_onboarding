
import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, View, KnowledgeItem, OnboardingInfo } from '../types';
import { TASK_TYPE_STYLES } from '../constants';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl } from '../utils/calendar';
import { EditIcon, DeleteIcon, LinkIcon, UserIcon, GrabberIcon, PaperclipIcon, CalendarIcon, MailIcon } from './Icons';
import { TaskDetailModal } from './TaskDetailModal';


interface TaskCardProps {
  task: Task;
  view: View;
  knowledgeItems: KnowledgeItem[];
  onboardingInfo: OnboardingInfo;
  currentProfileId?: string;

  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
  onToggleSubtaskComplete?: (taskId: string, subtaskId: string) => void;
  isOverlay?: boolean;  
}

const formatCompletionDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const urlRegex = /((https?:\/\/|www\.)[^\s]+)/gi;

const normalizeLink = (u: string) => {
  let s = u.trim().replace(/[),.]+$/g, ''); // limpia puntuación final
  if (s.toLowerCase().startsWith('www.')) s = `https://${s}`;
  return s;
};

const parseResource = (raw?: string) => {
  const text = (raw ?? '').trim();
  if (!text) return { description: '', links: [] as string[] };

  const matches = text.match(urlRegex) ?? [];
  const links = matches.map(normalizeLink);

  const description = text
    .replace(urlRegex, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { description, links };
};

export const TaskCard: React.FC<TaskCardProps> = React.memo(({ task, view, knowledgeItems, onboardingInfo, onEdit, onDelete, onToggleComplete, onToggleSubtaskComplete, isOverlay }) => {
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const calendarMenuRef = useRef<HTMLDivElement>(null);

  // Permisos: admin solo institucionales; líder solo no-institucionales
  const canManage =
    (view === 'admin' && !!task.isGlobal) ||
    (view === 'leader' && !task.isGlobal);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: view === 'newHire' || !canManage });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isOverlay ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : undefined,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarMenuRef.current && !calendarMenuRef.current.contains(event.target as Node)) {
        setIsCalendarMenuOpen(false);
      }
    };

    if (isCalendarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarMenuOpen]);

  const handleAddToCalendar = (calendarType: 'google' | 'outlook') => {
    const url =
        calendarType === 'google'
        ? generateGoogleCalendarUrl(task, onboardingInfo)
        : generateOutlookCalendarUrl(task, onboardingInfo);

    if (!url) {
        console.warn('[calendar] No se pudo generar URL', { calendarType, task, onboardingInfo });
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    setIsCalendarMenuOpen(false);
 };

  const { icon, color } = TASK_TYPE_STYLES[task.type];

  const linkedItems = (task.linkedKnowledgeItemIds ?? [])
    .map(id => knowledgeItems.find(k => k.id === id))
    .filter(Boolean) as KnowledgeItem[];

  const openKnowledgeItem = (item: KnowledgeItem) => {
    const url = item.url || item.attachment?.url;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-4 rounded-lg shadow-sm border-l-4 transition-all overflow-hidden bg-white ${color} ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
            {view === 'newHire' && onToggleComplete && (
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleComplete(task.id)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan cursor-pointer"
                />
            )}
            <div className="flex-shrink-0 pt-0.5">{icon}</div>
            <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                    <p className={`font-semibold text-slate-800 ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                    </p>
                </div>

                {task.completed && task.completedAt && (
                    <p className="text-xs text-emerald-600 mt-1">
                        Completado el {formatCompletionDate(task.completedAt)}
                    </p>
                )}
            </div>
        </div>
        
        <div className="flex items-center space-x-2">
            <div className="relative" ref={calendarMenuRef}>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCalendarMenuOpen(prev => !prev);
                    }}
                    className="p-1.5 text-slate-500 hover:text-brand-cyan hover:bg-brand-cyan/10 rounded-md transition-colors"
                    aria-label="Añadir al calendario"
                >
                    <CalendarIcon />
                </button>
                
                {isCalendarMenuOpen && (
                    <div
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-slate-200"
                        onClick={(e) => e.stopPropagation()} // evita que clicks adentro “salgan” al card
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCalendar('google');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-t-md"
                        >
                            Google Calendar
                        </button>
                        
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCalendar('outlook');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-b-md"
                        >
                            Outlook Calendar
                        </button>
                    </div>
                )}
            </div>

            {canManage && (
                <button {...attributes} {...listeners} className="text-slate-400 hover:text-slate-600 cursor-grab focus:cursor-grabbing focus:outline-none">
                    <GrabberIcon />
                </button>
            )}
        </div>
      </div>

      <div className="mt-3 pl-8 space-y-2 text-sm">
        <div className="flex items-center text-slate-600">
            <UserIcon />
            <span className="ml-2">{task.referent.name}</span>
            {task.referent.email && (
              <a href={`mailto:${task.referent.email}`} title={`Enviar correo a ${task.referent.name}`} className="ml-2 p-1 text-slate-400 hover:text-brand-cyan rounded-full hover:bg-brand-cyan/10 transition-colors">
                <MailIcon />
              </a>
            )}
        </div>
        {task.resource && (() => {
            const { description, links } = parseResource(task.resource);
            const hasSomething = description.length > 0 || links.length > 0;
            if (!hasSomething) return null;
        
            return (
                <div className="flex items-center text-slate-600 min-w-0">
                    <LinkIcon />
                    <button
                        type="button"
                        onClick={() => !isDragging && setIsDetailOpen(true)}
                        className="ml-2 text-brand-cyan hover:underline truncate"
                        title="Ver detalle"
                    >
                        Ver detalle
                        {links.length > 0 ? ` · ${links.length} link${links.length > 1 ? 's' : ''}` : ''}
                        {description ? ` · Nota` : ''}
                    </button>
                </div>
            );
        })()}

        {linkedItems.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 w-full min-w-0">
                {linkedItems.map(item => {
                    const clickable = !!(item.url || item.attachment?.url);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => clickable && openKnowledgeItem(item)}
                            className={`max-w-full min-w-0 overflow-hidden text-left inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition
                                ${clickable ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-500 cursor-default'}`}
                            title={item.description}
                        >
                            <span className="font-semibold truncate min-w-0">{item.title}</span>
                            <span className="text-slate-400 shrink-0"></span>
                        </button>
                    );
                })}
            </div>
        )}

        {task.attachments && task.attachments.length > 0 && (
            task.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center text-slate-600">
                    <PaperclipIcon />
                    <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={attachment.name}
                        className="ml-2 text-brand-cyan hover:underline truncate"
                        title={attachment.name}
                    >
                        {attachment.name}
                    </a>
                </div>
            ))
        )}
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-4 pt-3 pl-8 border-t border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtareas</h4>
            {task.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-start">
                    <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => onToggleSubtaskComplete?.(task.id, subtask.id)}
                        disabled={view !== 'newHire'}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan disabled:bg-slate-200 disabled:cursor-not-allowed flex-shrink-0"
                        aria-label={subtask.title}
                    />
                    <div className="ml-3">
                        <label
                            className={`text-sm ${subtask.completed ? 'line-through text-slate-500' : 'text-slate-700'}`}
                        >
                            {subtask.title}
                        </label>
                        {subtask.completed && subtask.completedAt && (
                            <p className="text-xs text-emerald-600">
                                Completado el {formatCompletionDate(subtask.completedAt)}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}

      {task.isGlobal && view !== 'admin' && (
            <div className="mt-3 pl-8">
                <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-700 text-[11px] font-semibold px-2.5 py-0.5">
                Institucional
                </span>
            </div>
      )}

      {canManage && onEdit && onDelete && (
        <div className="flex justify-end items-center mt-3 space-x-2">            
            <button onClick={() => onEdit(task)} className="p-1.5 text-slate-500 hover:text-brand-cyan hover:bg-brand-cyan/10 rounded-md transition-colors">
                <EditIcon />
            </button>
            <button onClick={() => onDelete(task.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors">
                <DeleteIcon />
            </button>
        </div>
      )}

      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={task}
      />
    </div>
  );
});
