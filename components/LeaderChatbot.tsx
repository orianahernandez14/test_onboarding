
import React from 'react';
import { LeaderChatbotIcon } from './Icons';
import { GenericChatbot } from './GenericChatbot';

interface LeaderChatbotProps {
    showPlusButton: boolean;
}

const LEADER_CONVERSATION_TREE: Record<string, { text: string; options?: { text: string; next: string }[] }> = {
  welcome: {
    text: "¡Hola! Soy tu asistente para líderes. Estoy aquí para ayudarte a crear un plan de onboarding efectivo para tu nuevo integrante. ¿Cómo puedo ayudarte?",
    options: [
      { text: "¿Cómo empiezo a configurar el plan?", next: 'startSetup' },
      { text: "¿Cómo creo una nueva tarea?", next: 'createTask' },
      { text: "¿Para qué sirve el Repositorio?", next: 'knowledgeBase' },
      { text: "¿Qué información debo poner en la bienvenida?", next: 'welcomeInfo' },
      { text: "Explícame los tipos de tareas.", next: 'taskTypes' },
    ],
  },
  startSetup: {
    text: "Es simple. Primero, ve a la sección de bienvenida y haz clic en el botón de editar (el lápiz) para añadir los detalles del puesto, el equipo y la fecha de inicio. Luego, usa el botón '+' en la esquina inferior derecha para empezar a crear las tareas para la primera semana.",
    options: [{ text: "Volver al menú principal", next: 'welcome' }],
  },
  createTask: {
    text: "Para añadir una tarea, haz clic en el botón flotante '+' en la vista 'Tablero'. Se abrirá un formulario donde podrás definir el título, el día, la semana, el tipo de tarea, un referente y adjuntar recursos o links. ¡Incluso puedes añadir subtareas!",
    options: [{ text: "Volver al menú principal", next: 'welcome' }],
  },
  knowledgeBase: {
    text: "El Repositorio es un lugar centralizado para todos los recursos importantes: manuales, normativas, links a herramientas, etc. Puedes añadir nuevos recursos desde la vista 'Repositorio' usando el mismo botón '+'. Esto le dará al ingresante un lugar único para consultar información clave.",
    options: [{ text: "Volver al menú principal", next: 'welcome' }],
  },
  welcomeInfo: {
    text: "En la sección de bienvenida, es ideal que incluyas el nombre del ingresante, su puesto, un resumen de sus responsabilidades, quiénes son sus compañeros, su jefe directo y la fecha de inicio. Esto le dará un contexto claro desde el primer día.",
    options: [{ text: "Volver al menú principal", next: 'welcome' }],
  },
  taskTypes: {
    text: "Los tipos de tareas te ayudan a categorizar las actividades: 🤝 Reunión para citas clave, 💻 Configuración para preparar herramientas, 📚 Lectura para documentos importantes y ✅ Tarea Operativa para actividades prácticas del día a día. Esto ayuda a visualizar la naturaleza de la semana.",
    options: [{ text: "Volver al menú principal", next: 'welcome' }],
  },
};

export const LeaderChatbot: React.FC<LeaderChatbotProps> = ({ showPlusButton }) => {
    const triggerPositionClassName = showPlusButton ? 'bottom-28 right-8' : 'bottom-8 right-8';
    const windowPositionClassName = showPlusButton ? 'bottom-44 right-8' : 'bottom-24 right-8';

    return (
        <GenericChatbot
            conversationTree={LEADER_CONVERSATION_TREE}
            initialNode="welcome"
            triggerButtonIcon={<LeaderChatbotIcon className="w-6 h-6"/>}
            triggerButtonClassName="bg-brand-yellow text-slate hover:bg-brand-yellow focus:ring-slate-500"
            chatHeaderTitle="Asistente para Líderes"
            botMessageClassName="bg-white text-slate-700 rounded-bl-none"
            userMessageClassName="bg-slate-600 text-white rounded-br-none"
            optionButtonClassName="text-slate-700 bg-slate-100 hover:bg-slate-200"
            triggerPositionClassName="bottom-8 right-8"
            windowPositionClassName="bottom-24 right-8"
        />
    );
};