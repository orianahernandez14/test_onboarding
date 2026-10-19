import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Task, TaskType, TASK_TYPE_LABEL, Attachment, Subtask, KnowledgeItem } from '../types';
import { DAYS } from '../constants';
import { DeleteIcon } from './Icons';
import { BaseModal } from './BaseModal';
import { View } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    task: Omit<Task, 'id' | 'completed'> & { isMassive?: boolean },
    scope?: 'individual' | 'team'
  ) => void;
  taskData?: Task | null;
  selectedWeek: number;
  knowledgeItems: KnowledgeItem[];
  initialDay?: string;
  view: View;
  teamName?: string;
  currentProfileId?: string;
}

const dayToLabel = (d: number) => `Día ${d}`;
const labelToDay = (label: string) =>
  Number(String(label).replace('Día', '').trim()) || 1;

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskData,
  selectedWeek,
  knowledgeItems,
  initialDay,
  view,
  teamName,
  currentProfileId,
}) => {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState<string>(DAYS[0]);
  const [week, setWeek] = useState(selectedWeek);
  const [resource, setResource] = useState('');
  const [referentName, setReferentName] = useState('');
  const [referentEmail, setReferentEmail] = useState('');
  const [type, setType] = useState<TaskType>(TaskType.OPERATIONAL);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [resourceSearch, setResourceSearch] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [isMassive, setIsMassive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (taskData) {
      setTitle(taskData.title);
      setDay(dayToLabel(taskData.day));
      setWeek(taskData.week);
      setReferentName(taskData.referent.name);
      setReferentEmail(taskData.referent.email || '');
      setResource(taskData.resource || '');
      setResourceSearch('');
      setType(taskData.type);
      setAttachments(taskData.attachments || []);
      setSubtasks(taskData.subtasks || []);
      setLinkedIds(taskData.linkedKnowledgeItemIds || []);
      setIsGlobal(!!taskData.isGlobal);

      // Editar nunca debería “quedar masivo”
      setIsMassive(false);
    } else {
      setTitle('');
      setDay(initialDay ?? DAYS[0]);
      setWeek(selectedWeek);
      setResource('');
      setReferentName('');
      setReferentEmail('');
      setType(TaskType.OPERATIONAL);
      setAttachments([]);
      setSubtasks([]);
      setLinkedIds([]);
      setResourceSearch('');
      setIsGlobal(false);

      // Nueva tarea: default individual
      setIsMassive(false);
    }
  }, [taskData, isOpen, selectedWeek, initialDay]);

  const toggleLinked = (id: string) => {
    setLinkedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const filteredKnowledgeItems = knowledgeItems.filter(k => {
    const q = resourceSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (k.title ?? '').toLowerCase().includes(q) ||
      (k.description ?? '').toLowerCase().includes(q)
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newAttachmentsPromises = files.map((file: File) => {
      return new Promise<Attachment>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve({ name: file.name, url: event.target.result as string });
          } else {
            reject(new Error("Couldn't read file"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newAttachmentsPromises).then(newAttachments => {
      setAttachments(prev => [...prev, ...newAttachments]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim() === '') return;
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks(prev => [...prev, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
  };

  const handleSubtaskInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  const normalizeIfSingleUrl = (text: string) => {
    const t = text.trim();
    if (!t) return undefined;
    if (/\s/.test(t)) return t; // descripción + links
    if (/^(https?:\/\/|www\.)/i.test(t)) return normalizeUrl(t);
    return t;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !referentName) return;

    const submittedTask = {
      title,
      day: labelToDay(day), 
      week,
      resource: normalizeIfSingleUrl(resource),
      referent: { name: referentName, email: referentEmail },
      type,
      attachments,
      subtasks,
      linkedKnowledgeItemIds: linkedIds,
      isGlobal: view === 'admin' ? true : isGlobal,
      isMassive: view === 'leader' && !taskData ? isMassive : false,
      createdInProfileId: currentProfileId,
    };

    onSubmit(submittedTask, (!taskData && isMassive) ? 'team' : 'individual');
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 pr-14">
          <h2 className="text-xl font-bold text-slate-800 font-heading pr-10">
            {taskData ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <p className="text-sm text-slate-500">
            Definí la tarea, referente, subtareas y adjuntos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-4">

              {(view === 'admin' || (!taskData && view === 'leader')) && (
                <div className="mb-6 flex items-center gap-3 p-3 rounded-md border bg-brand-cyan/10 border-brand-cyan/30">
                  <input
                    type="checkbox"
                    id="scope-task"
                    checked={view === 'admin' ? true : isMassive}
                    readOnly={view === 'admin'}
                    onChange={(e) => {
                      if (view !== 'admin') setIsMassive(e.target.checked);
                    }}
                    className={`h-4 w-4 text-brand-cyan focus:ring-brand-cyan border-brand-cyan/30 rounded ${
                      view === 'admin' ? 'cursor-not-allowed opacity-80' : ''
                    }`}
                  />

                  <label htmlFor="scope-task" className="ml-2 block text-sm font-medium text-slate-700">
                    {view === 'admin'
                      ? 'Tarea institucional (aplica a todos los ingresos)'
                      : `Asignar esta tarea a todo el equipo (${teamName || 'Sin equipo'})`}
                  </label>
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título de la Tarea</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-
                  brand-cyan focus:ring-brand-cyan sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="referentName" className="block text-sm font-medium text-slate-700">Nombre del Referente</label>
                  <input
                    type="text"
                    id="referentName"
                    value={referentName}
                    onChange={(e) => setReferentName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-
                    brand-cyan focus:ring-brand-cyan sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="referentEmail" className="block text-sm font-medium text-slate-700">Email (Opcional)</label>
                  <input
                    type="email"
                    id="referentEmail"
                    value={referentEmail}
                    onChange={(e) => setReferentEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-
                    brand-cyan focus:ring-brand-cyan sm:text-sm"
                    placeholder="ejemplo@dominio.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="resource" className="block text-sm font-medium text-slate-700">
                  Descripción o Recurso (Opcional)
                </label>

                <textarea
                  id="resource"
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  rows={3}
                  placeholder={`Podés escribir una descripción y pegar links en cualquier parte.\nEj: Revisar guía www.google.com.ar`}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-
                  brand-cyan focus:ring-brand-cyan sm:text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.stopPropagation();
                  }}
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700">
                  Vincular recursos del repositorio
                </label>

                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Buscar recurso..."
                  className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-
                  brand-cyan focus:ring-brand-cyan sm:text-sm"
                />

                <div className="mt-3 max-h-40 overflow-y-auto rounded-md border border-slate-200">
                  {filteredKnowledgeItems.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">No hay recursos que coincidan.</div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {filteredKnowledgeItems.map((item) => {
                        const checked = linkedIds.includes(item.id);
                        return (
                          <li key={item.id} className="flex items-start gap-3 p-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleLinked(item.id)}
                              className="mt-1"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">
                                {item.title ?? 'Recurso'}{' '}
                              </div>
                              {item.description ? (
                                <div className="text-xs text-slate-500 line-clamp-2">{item.description}</div>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {linkedIds.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600">
                    {linkedIds.length} recurso(s) vinculado(s)
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Subtareas</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={handleSubtaskInputKeyDown}
                    placeholder="Añadir una subtarea..."
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-cyan border border-transparent rounded-md shadow-sm hover:bg-brand-cyan/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-cyan"
                  >
                    Añadir
                  </button>
                </div>
                {subtasks.length > 0 && (
                  <div className="mt-3">
                    <ul className="border border-slate-200 rounded-md divide-y divide-slate-200">
                      {subtasks.map((subtask) => (
                        <li key={subtask.id} className="pl-3 pr-2 py-2 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate">{subtask.title}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtask(subtask.id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Adjuntos</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-cyan hover:text-brand-cyan/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-cyan">
                        <span>Sube tus archivos</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} ref={fileInputRef} />
                      </label>
                      <p className="pl-1">o arrástralos aquí</p>
                    </div>
                    <p className="text-xs text-slate-500">Imágenes, documentos, etc.</p>
                  </div>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-3">
                    <ul className="border border-slate-200 rounded-md divide-y divide-slate-200">
                      {attachments.map((file, index) => (
                        <li key={index} className="pl-3 pr-2 py-2 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="week" className="block text-sm font-medium text-slate-700">Semana</label>
                  <select
                    id="week"
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                  >
                    {[1, 2, 3, 4].map(w => <option key={w} value={w}>Semana {w}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-slate-700">Día</label>
                  <select
                    id="day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo de Tarea</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                >
                  {Object.values(TaskType).map(t => <option key={t} value={t}>{TASK_TYPE_LABEL[t]}</option>)}
                </select>
              </div>

            </div>
          </div>

          <div className="bg-slate-50 px-6 py-3 flex justify-end items-center space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-cyan"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-cyan border border-transparent rounded-md shadow-sm hover:bg-brand-cyan/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-cyan"
            >
              {taskData ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};