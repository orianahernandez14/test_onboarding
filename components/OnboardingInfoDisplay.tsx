
import React, { useState } from 'react';
import { OnboardingInfo, View } from '../types';
import { EditIcon, WelcomeIcon, BriefcaseIcon, InfoIcon, TeamIcon, ManagerIcon, JurisdictionIcon, CalendarIcon, ChevronDownIcon, DeskIcon, LaptopIcon, AddressIcon, AdminIcon, HomeIcon } from './Icons';

interface OnboardingInfoDisplayProps {
  info: OnboardingInfo;
  view: View;
  onEdit: () => void;
}

const InfoItem: React.FC<{icon: React.ReactNode, label: string, value: string | string[] | undefined}> = ({ icon, label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="flex items-start">
            <div className="flex-shrink-0 mt-1 text-brand-cyan">{icon}</div>
            <div className="ml-4">
                <p className="font-semibold text-slate-700 text-sm">{label}</p>
                {Array.isArray(value) ? (
                    <p className="text-slate-600 text-sm">{value.join(', ')}</p>
                ) : (
                    <p className="text-slate-600 whitespace-pre-wrap text-sm">{value}</p>
                )}
            </div>
        </div>
    );
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No establecida';
    const date = new Date(dateString + 'T00:00:00'); // Handle timezone
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};


export const OnboardingInfoDisplay: React.FC<OnboardingInfoDisplayProps> = React.memo(({ info, view, onEdit }) => {
  const [isJobDetailsVisible, setIsJobDetailsVisible] = useState(false);
  const [isWorkplaceDetailsVisible, setIsWorkplaceDetailsVisible] = useState(false);

  const hasInfo = info && (info.newHireName || info.jobTitle || info.onboardingStartDate);
  
  // Refined check for Job Details
  const hasJobDetails = info && (
    info.jobTitle || 
    info.jobSummary || 
    info.teamName || 
    info.teamFunctions || 
    (info.teamMembers && info.teamMembers.length > 0) || 
    info.manager || 
    info.teamLead ||
    info.managerPosition ||
    info.teamLeadPosition
  );

  // Refined check for Workplace Details
  const hasWorkplaceDetails = info && (
    info.deskNumber || 
    info.workEquipment || 
    info.workAddress || 
    (info.remoteWorkDay && info.remoteWorkDay !== 'Ninguno')
  );

  const formatAuthority = (name?: string, position?: string) => {
    if (!name && !position) return undefined;
    if (name && position) return `${name} (${position})`;
    return name || position; // si solo completaron uno
  };

  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Lógica de identidad basada en el rol actual
  const getActiveIdentity = () => {
    if (view === 'leader') return info.manager;
    if (view === 'newHire') return info.newHireName;
    return 'Administrador'; // Para admin no solemos tener nombre en OnboardingInfo
  };

  const activeIdentity = getActiveIdentity();
  const initials = view === 'admin' ? 'AD' : getInitials(activeIdentity);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8 relative border border-slate-200">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 flex flex-col items-center text-center md:w-1/4">
          <div className="w-20 h-20 bg-brand-cyan/10 text-brand-navy rounded-full flex items-center justify-center text-xl font-black tracking-wide">
            {view === 'admin' ? <AdminIcon className="w-10 h-10 text-grey" /> : (initials || <WelcomeIcon />)}
          </div>
          {view === 'leader' ? (
            <>
              <h2 className="text-xl font-bold text-slate-800 mt-4 font-heading">
                ¡Bienvenido/a{info.manager ? `, ${info.manager}` : ''}!
              </h2>
              <p className="text-slate-600 mt-2 text-sm">
                Gestiona el ingreso de <strong>{info.newHireName || 'tu ingresante'}</strong>. Tienes acceso total para editar su plan de tareas.
              </p>
            </>
          ) : view === 'admin' ? (
            <>
              <h2 className="text-xl font-bold text-slate-800 mt-4 font-heading">
                Gestión Organizacional
              </h2>
              <p className="text-slate-600 mt-2 text-sm">
                Supervisa el progreso de <strong>{info.newHireName || 'este ingresante'}</strong> y asegura que el equipo de {info.teamName || 'su área'} cumpla con los hitos.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-800 mt-4 font-heading">
                ¡Bienvenido/a{info.newHireName ? `, ${info.newHireName}` : ''}!
              </h2>
              <p className="text-slate-600 mt-2 text-sm">
                Este es tu espacio centralizado. Aquí encontrarás todo lo que necesitas para tus primeras semanas en {info.teamName || 'la organización'}.
              </p>
            </>
          )}
        </div>

        <div className="flex-grow md:w-3/4">
          {hasInfo ? (
            <div className="divide-y divide-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5">
                    <InfoItem icon={<CalendarIcon />} label="Fecha de Inicio" value={formatDate(info.onboardingStartDate)} />
                    <InfoItem icon={<JurisdictionIcon />} label="Jurisdicción / Organismo" value={info.jurisdiction} />
                </div>
                
                {hasJobDetails && (
                    <div className="py-4">
                        <button
                            onClick={() => setIsJobDetailsVisible(!isJobDetailsVisible)}
                            className="w-full flex justify-between items-center text-left font-bold text-slate-800 hover:text-brand-cyan focus:outline-none mb-3 group"
                            aria-expanded={isJobDetailsVisible}
                        >
                            <span className="uppercase text-xs font-black tracking-widest text-slate-500 group-hover:text-brand-cyan transition-colors">
                              Detalles del puesto y equipo
                              <span className="ml-2 font-normal tracking-normal text-slate-500 normal-case">
                                (Puesto, equipo, jefe directo, autoridad del área)
                              </span>
                            </span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isJobDetailsVisible ? 'rotate-180' : ''}`} />
                        </button>
                        {isJobDetailsVisible && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 animate-fade-in-down">
                                <InfoItem icon={<BriefcaseIcon />} label="Puesto" value={info.jobTitle} />
                                <InfoItem icon={<TeamIcon />} label="Equipo" value={info.teamName} />
                                <div className="sm:col-span-2">
                                  <InfoItem icon={<InfoIcon />} label="Resumen del Puesto" value={info.jobSummary} />
                                </div>
                                <div className="sm:col-span-2">
                                  <InfoItem icon={<InfoIcon />} label="Funciones del Área" value={info.teamFunctions} />
                                </div>
                                <InfoItem icon={<TeamIcon />} label="Compañeros" value={info.teamMembers} />
                                <InfoItem icon={<ManagerIcon />} label="Jefe Directo" value={formatAuthority(info.manager, info.managerPosition)} />
                                <InfoItem icon={<ManagerIcon />} label="Autoridad del Área" value={formatAuthority(info.teamLead, info.teamLeadPosition)} />
                            </div>
                        )}
                    </div>
                )}

                {hasWorkplaceDetails && (
                    <div className="pt-4">
                        <button
                            onClick={() => setIsWorkplaceDetailsVisible(!isWorkplaceDetailsVisible)}
                            className="w-full flex justify-between items-center text-left font-bold text-slate-800 hover:text-brand-cyan focus:outline-none mb-3 group"
                            aria-expanded={isWorkplaceDetailsVisible}
                        >
                            <span className="uppercase text-xs font-black tracking-widest text-slate-500 group-hover:text-brand-cyan transition-colors">
                              Espacio de trabajo y equipamiento
                              <span className="ml-2 font-normal tracking-normal text-slate-500 normal-case">
                                (Escritorio, modalidad remota, dirección, equipamiento)
                              </span>
                            </span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isWorkplaceDetailsVisible ? 'rotate-180' : ''}`} />
                        </button>
                        {isWorkplaceDetailsVisible && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 animate-fade-in-down">
                                <InfoItem icon={<DeskIcon />} label="Nro. de escritorio" value={info.deskNumber} />
                                <InfoItem icon={<HomeIcon />} label="Día de trabajo remoto" value={info.remoteWorkDay} />
                                <div className="sm:col-span-2">
                                  <InfoItem icon={<AddressIcon />} label="Domicilio laboral" value={info.workAddress} />
                                </div>
                                <div className="sm:col-span-2">
                                  <InfoItem icon={<LaptopIcon />} label="Equipamiento asignado" value={info.workEquipment} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
          ) : (view === 'leader' || view === 'admin') ? (
             <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-8 border-2 border-dashed border-slate-200">
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-700 font-heading">Información de Bienvenida Pendiente</h3>
                    <p className="text-slate-500 mt-2 text-sm">Completa los detalles del puesto para que el ingresante tenga contexto desde el Día 1.</p>
                    <button onClick={onEdit} className="mt-4 px-6 py-2 text-sm font-bold text-white bg-brand-cyan rounded-lg shadow-lg hover:bg-brand-cyan/80 transition-all active:scale-95">
                        Configurar Bienvenida
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-8">
              <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-700 font-heading">Preparando tu llegada...</h3>
                  <p className="text-slate-500 mt-2">Tu líder está completando la información de tu puesto y equipo.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {(view === 'leader' || view === 'admin') && (
        <button 
          onClick={onEdit} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-brand-cyan hover:bg-brand-cyan/10 rounded-full transition-all focus:outline-none"
          title="Editar información de bienvenida"
        >
          <EditIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
});
