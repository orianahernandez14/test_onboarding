
import React from 'react';
import { ChatbotIcon } from './Icons';
import { GenericChatbot } from './GenericChatbot';
import { OnboardingProfile } from '../types';

interface ChatbotProps {
    profile: OnboardingProfile;
}

const NEW_HIRE_CONVERSATION_TREE: Record<string, { text: string; options?: { text: string; next: string }[] }> = {
  welcome: {
    text: "¡Hola! Bienvenido a tu plan de onboarding. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    options: [
      { text: "¿Qué tengo que hacer hoy?", next: 'today' },
      { text: "¿Dónde está mi oficina?", next: 'office' },
      { text: "¿Quién es mi jefe?", next: 'manager' },
      { text: "¿Cómo uso el Repositorio?", next: 'knowledge' },
    ],
  },
  today: {
    text: "Echa un vistazo a la columna del día de hoy en tu tablero. Allí verás las tareas, reuniones y lecturas que tu líder ha preparado para ti. No olvides marcarlas como completadas cuando termines.",
    options: [{ text: "Volver al menú", next: 'welcome' }],
  },
  office: {
    text: "Puedes encontrar los detalles de tu ubicación, número de escritorio y equipamiento en la tarjeta de información de bienvenida arriba del tablero.",
    options: [{ text: "Volver al menú", next: 'welcome' }],
  },
  manager: {
    text: "Toda la información sobre tu equipo, compañeros y responsables directos está detallada en la sección de Bienvenida. Allí podrás ver sus nombres e incluso enviarles un correo.",
    options: [{ text: "Volver al menú", next: 'welcome' }],
  },
  knowledge: {
    text: "En la pestaña 'Repositorio' tienes acceso a manuales, guías de estilo y herramientas. Algunos recursos pueden estar bloqueados hasta que llegues a un día específico de tu onboarding.",
    options: [{ text: "Volver al menú", next: 'welcome' }],
  },
};

export const Chatbot: React.FC<ChatbotProps> = ({ profile }) => {
    return (
        <GenericChatbot
            conversationTree={NEW_HIRE_CONVERSATION_TREE}
            initialNode="welcome"
            triggerButtonIcon={<ChatbotIcon className="w-6 h-6"/>}
            triggerButtonClassName="bg-brand-yellow text-slate hover:bg-brand-yellow focus:ring-slate-500"
            chatHeaderTitle={`Asistente para ${profile.info.newHireName || 'Ingresantes'}`}
            botMessageClassName="bg-white text-slate-700 rounded-bl-none"
            userMessageClassName="bg-slate-600 text-white rounded-br-none"
            optionButtonClassName="text-slate-700 bg-slate-100 hover:bg-slate-200"
            triggerPositionClassName="bottom-8 right-8"
            windowPositionClassName="bottom-24 right-8"
        />
    );
};
