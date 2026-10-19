
import React, { useState, useEffect, FormEvent } from 'react';
import { OnboardingInfo } from '../types';
import { BaseModal } from './BaseModal';

interface OnboardingInfoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: OnboardingInfo) => void;
  infoData: OnboardingInfo;
  profileId: string;
}

const remoteWorkDays = ['Ninguno', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const OnboardingInfoFormModal: React.FC<OnboardingInfoFormModalProps> = ({ isOpen, onClose, onSubmit, infoData, profileId }) => {
  const [editableProfileId, setEditableProfileId] = useState('');
  const [newHireName, setNewHireName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [teamName, setTeamName] = useState('');
  const [jobSummary, setJobSummary] = useState('');
  const [teamFunctions, setTeamFunctions] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [manager, setManager] = useState('');
  const [managerId, setManagerId] = useState('');
  const [managerPosition, setManagerPosition] = useState('');
  const [teamLead, setTeamLead] = useState('');
  const [teamLeadPosition, setTeamLeadPosition] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [onboardingStartDate, setOnboardingStartDate] = useState('');
  const [documentationDeadline, setDocumentationDeadline] = useState('');
  const [deskNumber, setDeskNumber] = useState('');
  const [workEquipment, setWorkEquipment] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [remoteWorkDay, setRemoteWorkDay] = useState('Ninguno');

  useEffect(() => {
    if (infoData) {
      setEditableProfileId(infoData.profileId || '');
      setNewHireName(infoData.newHireName || '');
      setJobTitle(infoData.jobTitle || '');
      setTeamName(infoData.teamName || '');
      setJobSummary(infoData.jobSummary || '');
      setTeamFunctions(infoData.teamFunctions || '');
      setTeamMembers(infoData.teamMembers || '');
      setManager(infoData.manager || '');
      setManagerId(infoData.managerId || '');
      setManagerPosition(infoData.managerPosition || '');
      setTeamLead(infoData.teamLead || '');
      setTeamLeadPosition(infoData.teamLeadPosition || '');
      setJurisdiction(infoData.jurisdiction || '');
      setOnboardingStartDate(infoData.onboardingStartDate || '');
      setDocumentationDeadline(infoData.documentationDeadline || '');
      setDeskNumber(infoData.deskNumber || '');
      setWorkEquipment(infoData.workEquipment || '');
      setWorkAddress(infoData.workAddress || '');
      setRemoteWorkDay(infoData.remoteWorkDay || 'Ninguno');
    }
  }, [infoData, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      profileId: editableProfileId.trim(),
      newHireName,
      jobTitle,
      teamName,
      jobSummary,
      teamFunctions,
      teamMembers: teamMembers.trim(),
      manager,
      managerId: managerId.trim(),
      managerPosition,
      teamLead,
      teamLeadPosition,
      jurisdiction,
      onboardingStartDate,
      documentationDeadline,
      deskNumber,
      workEquipment,
      workAddress,
      remoteWorkDay,
    });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 pr-14">
            <h2 className="text-xl font-bold text-slate-800 font-heading pr-10">Configuración de Onboarding</h2>
            <p className="text-sm text-slate-500">Completa los detalles clave para la bienvenida.</p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
          <div className="p-6 space-y-6">
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-cyan border-b pb-1">
                    Datos Principales
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="profileId"
                                className="block text-sm font-medium text-slate-700"
                            >
                                CUIL del Ingresante
                            </label>

                            <input
                                type="text"
                                id="profileId"
                                value={editableProfileId}
                                onChange={(e) => setEditableProfileId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                                placeholder="Ej: 27123456789"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="newHireName"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Nombre del Ingresante
                            </label>

                            <input
                                type="text"
                                id="newHireName"
                                value={newHireName}
                                onChange={(e) => setNewHireName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="teamName"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Nombre del Equipo / Área
                            </label>

                            <input
                                type="text"
                                id="teamName"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="onboardingStartDate"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Fecha de Inicio (Día 1)
                            </label>

                            <input
                                type="date"
                                id="onboardingStartDate"
                                value={onboardingStartDate}
                                onChange={(e) => setOnboardingStartDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="documentationDeadline"
                        className="block text-sm font-bold uppercase tracking-tighter text-[10px]"
                    >
                        Vencimiento Legajo Digital
                    </label>

                    <input
                        type="date"
                        id="documentationDeadline"
                        value={documentationDeadline}
                        onChange={(e) => setDocumentationDeadline(e.target.value)}
                        className="mt-1 block w-full rounded-md border-brand-cyan shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm bg-brand-cyan/10"
                    />
                </div>
            </section>

            <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
                <h3 className="text-xs font-extrabold tracking-[0.18em] text-brand-cyan uppercase">
                Definición del Puesto
                </h3>
            </div>

            <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                Nombre del Puesto
                </span>
                <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                placeholder="Ej.: Analista de datos"
                required
                />
            </label>

            <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                Resumen del Puesto
                </span>
                <textarea
                value={jobSummary}
                onChange={(e) => setJobSummary(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                rows={2}
                placeholder="Breve descripción del rol y responsabilidades principales"
                />
            </label>

            <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                Funciones del Área
                </span>
                <textarea
                value={teamFunctions}
                onChange={(e) => setTeamFunctions(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                rows={2}
                placeholder="Funciones principales del equipo o área"
                />
            </label>
            </section>

            <section className="space-y-4 pt-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-cyan border-b pb-1">
                    Definición del Equipo
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                        <label
                            htmlFor="managerId"
                            className="block text-sm font-medium text-slate-700"
                        >
                            CUIL del Jefe Directo
                        </label>

                        <input
                            type="text"
                            id="managerId"
                            value={managerId}
                            onChange={(e) => setManagerId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                            placeholder="Ej: 20123456789"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="jurisdiction"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Jurisdicción / Ministerio / Organismo
                        </label>

                        <input
                            type="text"
                            id="jurisdiction"
                            value={jurisdiction}
                            onChange={(e) => setJurisdiction(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                        />
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                        <label
                            htmlFor="manager"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Jefe Directo
                        </label>

                        <input
                            type="text"
                            id="manager"
                            value={manager}
                            onChange={(e) => setManager(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="teamLead"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Autoridad Superior
                        </label>

                        <input
                            type="text"
                            id="teamLead"
                            value={teamLead}
                            onChange={(e) => setTeamLead(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                        />
                    </div>

                </div>

                <div>
                    <label
                        htmlFor="teamMembers"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Compañeros (Separados por coma)
                    </label>

                    <textarea
                        id="teamMembers"
                        value={teamMembers}
                        onChange={(e) => setTeamMembers(e.target.value)}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                    />
                </div>

            </section>

            <section className="space-y-4 pt-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-cyan border-b pb-1">
                    Infraestructura y Logística
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="space-y-4">

                        <div>
                            <label
                                htmlFor="deskNumber"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Nro. de escritorio / Estación
                            </label>

                            <input
                                type="text"
                                id="deskNumber"
                                value={deskNumber}
                                onChange={(e) => setDeskNumber(e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="workAddress"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Domicilio Laboral (Piso, Oficina)
                            </label>

                            <input
                                type="text"
                                id="workAddress"
                                value={workAddress}
                                onChange={(e) => setWorkAddress(e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                            />
                        </div>

                    </div>

                    <div className="space-y-4">

                        <div>
                            <label
                                htmlFor="remoteWorkDay"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Día Remoto Acordado
                            </label>

                            <select
                                id="remoteWorkDay"
                                value={remoteWorkDay}
                                onChange={(e) => setRemoteWorkDay(e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                            >
                                {remoteWorkDays.map(day => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="workEquipment"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Equipamiento Detallado
                            </label>

                            <textarea
                                id="workEquipment"
                                value={workEquipment}
                                onChange={(e) => setWorkEquipment(e.target.value)}
                                rows={2}
                                placeholder="Ej: Laptop HP Serial XYZ, Monitor 24p, etc."
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-cyan focus:ring-brand-cyan sm:text-sm"
                            />
                        </div>

                    </div>

                </div>
            </section>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-end items-center space-x-3 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-brand-cyan border border-transparent rounded-lg shadow-lg hover:bg-brand-cyan/80 active:scale-95 transition-all">
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};
