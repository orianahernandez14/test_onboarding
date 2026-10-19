
import React from 'react';
import { Task } from '../types';
import { generateMailtoLink } from '../utils/email';
import { NotificationIcon } from './Icons';
import { BaseModal } from './BaseModal';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task || !task.referent.email) return null;

  const handleSendNotification = () => {
    const mailtoLink = generateMailtoLink(task);
    if (mailtoLink) {
      window.location.href = mailtoLink;
    }
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 text-center sm:text-left">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-cyan sm:mx-0 sm:h-10 sm:w-10">
            <NotificationIcon />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4">
            <h3 className="text-lg font-medium leading-6 text-slate-900">
              Notificar al Referente
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Se ha asignado a{' '}
              <strong className="font-semibold text-slate-700">
                {task.referent.name}
              </strong>{' '}
              a la tarea{' '}
              <strong className="font-semibold text-slate-700">
                &quot;{task.title}&quot;
              </strong>.
              ¿Deseas enviarle una notificación por correo ahora?
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-brand-cyan px-4 py-2 text-white hover:bg-brand-cyan/80 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={handleSendNotification}
       >
          Enviar Notificación
        </button>

        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={onClose}
       >
          Más tarde
        </button>
      </div>
    </BaseModal>
  );
};
