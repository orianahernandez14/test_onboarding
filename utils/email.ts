
import { Task } from '../types';

export const generateNotificationEmailBody = (task: Task): string => {
    let body = `Hola ${task.referent.name},\n\n`;
    body += `Te han asignado como referente para la siguiente tarea en el plan de onboarding:\n\n`;
    body += `Tarea: ${task.title}\n`;
    body += `Día: ${task.day}\n`;
    body += `Semana: ${task.week}\n\n`;
    body += `Tu rol como referente es clave, ya sea para una reunión, como mentor o para proveer guía en esta actividad.\n\n`;
    body += `Gracias por tu colaboración.\n\n`;
    body += `Saludos cordiales,`;
    return body;
};

export const generateMailtoLink = (task: Task): string => {
    if (!task.referent.email) return '';

    const subject = `Notificación de Tarea de Onboarding: ${task.title}`;
    const body = generateNotificationEmailBody(task);

    const mailto = `mailto:${task.referent.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return mailto;
};