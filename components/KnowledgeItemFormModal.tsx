import React, { useState, useEffect, FormEvent, useRef } from 'react';
import {
  KnowledgeItem,
  KnowledgeCategoryKey,
  KNOWLEDGE_CATEGORY_LABEL,
  Attachment,
  View
} from '../types';
import { DeleteIcon } from './Icons';
import { BaseModal } from './BaseModal';

interface KnowledgeItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    item: Omit<KnowledgeItem, 'id'> | KnowledgeItem,
    scope?: 'individual' | 'team'
  ) => void;
  itemData?: KnowledgeItem | null;
  view: View;
  currentProfileId?: string;
  currentTeamName?: string;
}

export const KnowledgeItemFormModal: React.FC<KnowledgeItemFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  itemData,
  view,
  currentProfileId,
  currentTeamName
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<KnowledgeCategoryKey>('TOOLS');
  const [resourceType, setResourceType] = useState<'link' | 'file'>('link');
  const [url, setUrl] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [visibleOnDay, setVisibleOnDay] = useState<string>('');
  const [shareWithTeam, setShareWithTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('TOOLS');
    setResourceType('link');
    setUrl('');
    setAttachment(null);
    setVisibleOnDay('');
    setShareWithTeam(false);
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    // ✅ Siempre limpiar error al abrir
    setError(null);

    if (itemData) {
      setTitle(itemData.title);
      setDescription(itemData.description);
      setCategory(itemData.category);
      setVisibleOnDay(itemData.visibleOnDay?.toString() ?? '');

      // Si tiene teamName, interpretamos que es "compartido con equipo"
      setShareWithTeam(!!itemData.teamName);

      if (itemData.url) {
        setResourceType('link');
        setUrl(itemData.url);
        setAttachment(null);
      } else if (itemData.attachment) {
        setResourceType('file');
        setAttachment(itemData.attachment);
        setUrl('');
      } else {
        // fallback
        setResourceType('link');
        setUrl('');
        setAttachment(null);
      }
    } else {
      resetForm();
    }
  }, [itemData, isOpen]);

  // ✅ Si el usuario corrige el scope/contexto, limpiamos el error
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
  }, [shareWithTeam, currentProfileId, currentTeamName, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachment({ name: file.name, url: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Limpiar error previo
    setError(null);

    if (!title || !category || !description) return;
    if (resourceType === 'link' && !url) return;
    if (resourceType === 'file' && !attachment) return;

    const day = visibleOnDay ? parseInt(visibleOnDay, 10) : undefined;
    if (day !== undefined && (Number.isNaN(day) || day < 1)) return;

    // ✅ Evitar recursos "huérfanos" en vista líder
    if (view === 'leader' && !shareWithTeam && !currentProfileId) {
      setError('Tenés que seleccionar un ingresante para publicar un recurso individual.');
      return;
    }

    // ✅ Scope explícito para evitar arrastres al editar
    const finalItem: Omit<KnowledgeItem, 'id'> = {
      title,
      description,
      category,
      visibleOnDay: day,
      isGlobal: view === 'admin',
      ...(resourceType === 'link' && { url }),
      ...(resourceType === 'file' && attachment && { attachment }),
    };

    const scope = view === 'leader' ? (shareWithTeam ? 'team' : 'individual') : undefined;

    if (itemData) onSubmit({ ...itemData, ...finalItem } as KnowledgeItem, scope);
    else onSubmit(finalItem, scope);

  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div
        className="overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 pr-14">
          <h2 className="text-xl font-bold text-slate-800 font-heading pr-10">
            {itemData ? 'Editar Recurso' : 'Nuevo Recurso'}
          </h2>
          <p className="text-sm text-slate-500">Cargá un recurso para el repositorio.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">
            {(view === 'admin' || view === 'leader') && (
              <div
                className={`mb-6 flex items-center gap-3 p-3 rounded-md border ${
                  view === 'admin'
                    ? 'bg-indigo-50 border-indigo-100'
                    : 'bg-brand-cyan/20 border-brand-cyan/30'
                }`}
              >
                <input
                  type="checkbox"
                  id="scope-knowledge"
                  checked={view === 'admin' ? true : shareWithTeam}
                  readOnly={view === 'admin'}
                  onChange={(e) => {
                    if (view !== 'admin') setShareWithTeam(e.target.checked);
                  }}
                  className={`h-4 w-4 rounded ${
                    view === 'admin'
                      ? 'text-indigo-600 border-indigo-300 cursor-not-allowed opacity-80'
                      : 'text-brand-cyan focus:ring-brand-cyan border-brand-cyan'
                  }`}
                />

                <label htmlFor="scope-knowledge" className="ml-2 block text-sm font-medium text-slate-700">
                  {view === 'admin'
                    ? 'Recurso institucional (visible para todos los ingresos)'
                    : `Compartir este recurso con todo el equipo (${currentTeamName || 'Sin equipo'})`}
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 mb-6">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="knowledge-title"
                  className="block text-sm font-medium text-slate-700"
                >
                  Título
                </label>
                <input
                  type="text"
                  id="knowledge-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Tipo de Recurso</label>
                <div className="mt-2 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setResourceType('link')}
                    className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-slate-300 text-sm font-medium ${
                      resourceType === 'link'
                        ? 'bg-brand-cyan text-white z-10'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType('file')}
                    className={`-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-slate-300 text-sm font-medium ${
                      resourceType === 'file'
                        ? 'bg-brand-cyan text-white z-10'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Archivo
                  </button>
                </div>
              </div>

              {resourceType === 'link' ? (
                <div>
                  <label
                    htmlFor="knowledge-url"
                    className="block text-sm font-medium text-slate-700"
                  >
                    URL del Recurso
                  </label>
                  <input
                    type="url"
                    id="knowledge-url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                    required={resourceType === 'link'}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Adjunto</label>
                  {attachment ? (
                    <div className="mt-2">
                      <div className="border border-slate-200 rounded-md divide-y divide-slate-200">
                        <div className="pl-3 pr-2 py-2 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate font-medium">
                              {attachment.name}
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setAttachment(null)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md bg-slate-50">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-slate-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-slate-600 justify-center">
                          <label
                            htmlFor="file-upload-knowledge"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-brand-cyan hover:text-brand-cyan/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-cyan"
                          >
                            <span>Sube un archivo</span>
                            <input
                              id="file-upload-knowledge"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              ref={fileInputRef}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500">Manuales, normativas o PDFs</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="knowledge-description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Descripción / Instrucciones
                </label>
                <textarea
                  id="knowledge-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="knowledge-category"
                  className="block text-sm font-medium text-slate-700"
                >
                  Categoría
                </label>
                <select
                  id="knowledge-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as KnowledgeCategoryKey)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                >
                  {(Object.keys(KNOWLEDGE_CATEGORY_LABEL) as KnowledgeCategoryKey[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {KNOWLEDGE_CATEGORY_LABEL[key]}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                <div className="flex items-center">
                  <input
                    type="number"
                    id="knowledge-visible-on-day"
                    value={visibleOnDay}
                    onChange={(e) => setVisibleOnDay(e.target.value)}
                    className="w-20 rounded-md border-slate-300 shadow-sm focus:ring-brand-cyan sm:text-sm mr-3"
                    min="1"
                  />
                  <div>
                    <label
                      htmlFor="knowledge-visible-on-day"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-tighter"
                    >
                      Habilitar en el Día X
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Vuelve el recurso disponible en un día específico.
                    </p>
                  </div>
                </div>                
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-lg border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-brand-cyan border border-transparent rounded-md shadow-sm hover:bg-brand-cyan/80 transition-all active:scale-95"
            >
              {itemData ? 'Guardar Cambios' : 'Publicar Recurso'}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};