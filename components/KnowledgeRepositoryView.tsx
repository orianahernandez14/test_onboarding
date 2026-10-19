
import React from 'react';
import JSZip from 'jszip';
import { KnowledgeItem, View, OnboardingInfo, KnowledgeCategoryKey, KNOWLEDGE_CATEGORY_LABEL } from '../types';
import { KnowledgeItemCard } from './KnowledgeItemCard';
import { ZipIcon, KnowledgeBookIcon } from './Icons';

interface RepositoryViewProps {
  items?: KnowledgeItem[];
  view: View;
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (itemId: string) => void;
  onboardingInfo?: OnboardingInfo;
}

const calculateOnboardingDay = (startDateString?: string): number => {
  if (!startDateString) return 0;
  
  const startDate = new Date(startDateString + 'T00:00:00');
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  if (currentDate < startDate) {
    return 0;
  }
  
  let workdays = 0;
  let tempDate = new Date(startDate);

  while(tempDate <= currentDate) {
      const dayOfWeek = tempDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
          workdays++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
  }
  return workdays;
};


export const RepositoryView: React.FC<RepositoryViewProps> = ({
  items = [],
  view,
  onEdit,
  onDelete,
  onboardingInfo,
}) => {
  
  const currentOnboardingDay = calculateOnboardingDay(
    onboardingInfo?.onboardingStartDate
  );
  
  const groupedItems = items.reduce((acc, item) => {
    const category = (item.category ?? 'INSTITUTIONAL') as KnowledgeCategoryKey;
    (acc[category] ||= []).push(item);
    return acc;
  }, {} as Record<KnowledgeCategoryKey, KnowledgeItem[]>);

  Object.keys(groupedItems).forEach((key) => {
    groupedItems[key as KnowledgeCategoryKey].sort((a, b) => {
      const aGlobal = !!a.isGlobal;
      const bGlobal = !!b.isGlobal;

      if (aGlobal === bGlobal) return 0;
      return aGlobal ? -1 : 1;
    });
  });

  const categories = Object.keys(groupedItems) as KnowledgeCategoryKey[];

  const handleZipExport = async () => {
    try {
        const zip = new JSZip();
        // Filtramos solo los items que tienen un archivo adjunto
        const filesToInclude = items.filter(item => item.attachment);

        if (filesToInclude.length > 0) {
            for (const item of filesToInclude) {
                if (item.attachment) {
                    // Los adjuntos se guardan como Data URLs (base64)
                    const base64Data = item.attachment.url.split(',')[1];
                    zip.file(item.attachment.name, base64Data, { base64: true });
                }
            }
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        const fileName = onboardingInfo?.newHireName ? onboardingInfo.newHireName.toLowerCase().replace(/\s+/g, '_') : 'gcba';
        link.download = `repositorio_${fileName}.zip`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al generar el ZIP:", error);
        alert("Hubo un error al generar el archivo comprimido.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-down pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 font-heading flex items-center gap-3">
          <KnowledgeBookIcon className="w-8 h-8 text-brand-cyan" />
          Recursos de Conocimiento
        </h2>
              
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={handleZipExport} className="flex items-center gap-2 text-[11px] font-bold text-brand-cyan hover:bg-brand-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-cyan px-3 py-1.5 rounded-lg transition-colors">
            <ZipIcon className="w-4 h-4" /> EXPORTAR REPOSITORIO
          </button>
        </div>
      </div>
      
      {categories.map(category => {
        const categoryItems = groupedItems[category];
        if (!categoryItems || categoryItems.length === 0) {
          return null;
        }
        return (
          <div key={category} className="animate-fade-in-down">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              {KNOWLEDGE_CATEGORY_LABEL[category]}
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] tracking-normal">{categoryItems.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryItems.map(item => (
                <KnowledgeItemCard
                  key={item.id}
                  item={item}
                  view={view}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentOnboardingDay={currentOnboardingDay}
                />
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="text-center text-slate-500">
                {view === 'admin' ? (
                  <>
                    <h3 className="text-lg font-medium text-slate-700">No hay recursos institucionales</h3>
                    <p className="mt-2">Haz clic en el botón '+' para empezar a añadir recursos globales.</p>
                  </>
                ) : view === 'leader' ? (
                  <>
                    <h3 className="text-lg font-medium text-slate-700">El Repositorio está vacío</h3>
                    <p className="mt-2">Haz clic en el botón '+' para empezar a añadir recursos para tu equipo.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-slate-700">El Repositorio está vacío</h3>
                    <p className="mt-2">Tu líder pronto añadirá aquí recursos y links de interés.</p>
                  </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
