
import React from 'react';
import { Task, KnowledgeItem } from '../types';
import { TASK_TYPE_STYLES } from '../constants';
import { LinkIcon, UserIcon, PaperclipIcon, MailIcon } from './Icons';
import { BaseModal } from './BaseModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  knowledgeItems?: KnowledgeItem[];
}

const formatCompletionDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
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

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, knowledgeItems }) => {
  if (!isOpen || !task) return null;

  const { icon } = TASK_TYPE_STYLES[task.type];

    const linkedIds =
    (task as any).linkedKnowledgeItemIds ??
    (task as any).knowledgeItemIds ??
    [];

  const linkedItems = (knowledgeItems ?? []).filter(ki => linkedIds.includes(ki.id));

  const openKnowledgeItem = (item: KnowledgeItem) => {
    const url = item.url || item.attachment?.url;
    if (!url) return;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (  
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div onClick={(e) => e.stopPropagation()}>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0 pt-1">{icon}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-heading pr-10">{task.title}</h2>            
            </div>
          </div>
          
          {task.completed && task.completedAt && (
            <div className="mb-4 bg-emerald-50 text-emerald-700 p-3 rounded-md text-sm">
                Completado el {formatCompletionDate(task.completedAt)}
            </div>
          )}
          
          <div className="space-y-4 text-sm">
            <div className="flex items-center text-slate-600">
              <UserIcon />
              <span className="ml-2 font-semibold mr-2">Referente:</span>
              <span>{task.referent.name}</span>
            </div>
            {task.referent.email && (
                <div className="flex items-center text-slate-600 pl-6">
                    <MailIcon />
                    <a href={`mailto:${task.referent.email}`} className="ml-2 text-brand-cyan hover:underline truncate">
                        {task.referent.email}
                    </a>
                </div>
            )}
            {task.resource && (() => {
              const { description, links } = parseResource(task.resource);

              return (
                <div className="text-slate-600">
                  <div className="flex items-center">
                    <LinkIcon />
                    <span className="ml-2 font-semibold">Descripción o Recurso:</span>
                  </div>
                  
                  {/* Descripción (texto libre) */}
                  {description && (
                    <div className="pl-6 mt-2">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {description}
                      </p>
                    </div>
                  )}
                  
                  {/* Links detectados */}
                  {links.length > 0 && (
                    <ul className="pl-6 mt-2 space-y-1">
                      {links.map((u, i) => (
                        <li key={`${u}-${i}`} className="truncate">
                          <a
                            href={u}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-cyan hover:underline break-all"
                          >
                            {u}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}

            {linkedItems.length > 0 && (
              <div className="text-slate-600">
                <div className="flex items-center">
                  <LinkIcon />
                  <span className="ml-2 font-semibold">Recursos vinculados:</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 pl-6 w-full min-w-0">
                  {linkedItems.map(item => {
                    const clickable = !!(item.url || item.attachment?.url);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => clickable && openKnowledgeItem(item)}
                        className={`max-w-full min-w-0 overflow-hidden text-left inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition
                          ${clickable
                            ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500 cursor-default'
                          }`}
                        title={item.description}
                      >
                        <span className="font-semibold truncate min-w-0">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {task.attachments && task.attachments.length > 0 && (
              <div>
                <div className="flex items-center text-slate-600 mb-2">
                    <PaperclipIcon />
                    <span className="ml-2 font-semibold">Adjuntos:</span>
                </div>
                <ul className="pl-6 space-y-1 list-disc list-inside">
                  {task.attachments.map((attachment, index) => (
                    <li key={index}>
                      <a href={attachment.url} download={attachment.name} className="text-brand-cyan hover:underline">
                        {attachment.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Subtareas</h4>
              <div className="space-y-2">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-start">
                     <input
                        type="checkbox"
                        checked={subtask.completed}
                        readOnly
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-cyan focus:ring-0 cursor-default"
                     />
                    <div className="ml-3 text-sm">
                       <p className={`${subtask.completed ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                        {subtask.title}
                       </p>
                       {subtask.completed && subtask.completedAt && (
                         <p className="text-xs text-emerald-600">
                           Completado el {formatCompletionDate(subtask.completedAt)}
                         </p>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3 flex justify-end items-center rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-cyan"
          >
            Cerrar
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
