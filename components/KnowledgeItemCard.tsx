
import React from 'react';
import { KnowledgeItem, View } from '../types';
import { EditIcon, DeleteIcon, LinkIcon, DownloadIcon, TinyLockIcon } from './Icons';

const normalizeUrl = (u?: string) => {
  if (!u) return '';
  let s = u.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.toLowerCase().startsWith('www.')) s = `https://${s}`;
  return s;
};

interface KnowledgeItemCardProps {
  item: KnowledgeItem;
  view: View;
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (itemId: string) => void;
  currentOnboardingDay: number;
}

export const KnowledgeItemCard: React.FC<KnowledgeItemCardProps> = React.memo(({ item, view, onEdit, onDelete, currentOnboardingDay }) => {
  const isLocked = item.visibleOnDay !== undefined && currentOnboardingDay < item.visibleOnDay;
  const canEdit = (view === 'admin' && item.isGlobal) || (view === 'leader' && !item.isGlobal);

  const safeUrl = normalizeUrl(item.url);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full transition-opacity ${isLocked ? 'opacity-75' : ''}`}>
      {item.isGlobal && view !== 'admin' && (
        <span className="absolute top-3 right-3 bg-cyan-100 text-cyan-800 text-xs font-medium px-2.5 py-0.5 rounded-full z-10">Institucional</span>
      )}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 pr-20 font-heading">{item.title}</h3>
        <p className="text-sm text-slate-600 mt-2 flex-grow">{item.description}</p>
         {isLocked && (
            <div className="mt-4 p-2 bg-amber-50 text-amber-800 text-xs rounded-md flex items-center">
                <div className="text-amber-500 mr-2 flex-shrink-0">
                    <TinyLockIcon />
                </div>
                <span>
                    Disponible el día {item.visibleOnDay} del onboarding.
                </span>
            </div>
        )}
      </div>
      <div className="p-5 bg-slate-50 rounded-b-lg flex justify-between items-center">
        {item.attachment ? (
           <a
              href={isLocked ? undefined : item.attachment.url}
              onClick={(e) => { if (isLocked) e.preventDefault(); }}
              download={item.attachment.name}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm transition-colors ${isLocked ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-cyan hover:bg-brand-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-cyan'}`}
              aria-disabled={isLocked}
              tabIndex={isLocked ? -1 : undefined}
            >
              <DownloadIcon />
              <span className="ml-2">Descargar</span>
            </a>
        ) : safeUrl ? (
            <a
              href={isLocked ? undefined : safeUrl}
              onClick={(e) => { if (isLocked) e.preventDefault(); }}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm transition-colors ${isLocked ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-cyan hover:bg-brand-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-cyan'}`}
              aria-disabled={isLocked}
              tabIndex={isLocked ? -1 : undefined}
            >
              <LinkIcon />
              <span className="ml-2">Acceder</span>
            </a>
        ): <div />}
        
        {canEdit && (
          <div className="flex items-center space-x-2">
            <button onClick={() => onEdit(item)} className="p-1.5 text-slate-500 hover:text-brand-cyan hover:bg-brand-cyan/20 rounded-md transition-colors" aria-label="Editar recurso">
              <EditIcon />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors" aria-label="Eliminar recurso">
              <DeleteIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
