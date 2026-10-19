import { Task, OnboardingInfo } from '../types';
import { getOnboardingStartDate, getTaskDate } from './date';

// Formats a Date object into YYYYMMDD for Google Calendar
const formatDateForGoogle = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

// Formats a Date object into YYYY-MM-DD for Outlook all-day events
const formatDateForOutlook = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const buildDescription = (task: Task): string => {
  let description = `Tipo de Tarea: ${task.type}\n`;
  description += `Referente: ${task.referent.name}${task.referent.email ? ` (${task.referent.email})` : ''}\n\n`;

  if (task.resource) {
    description += `Recurso: ${task.resource}\n`;
  }
  if (task.attachments && task.attachments.length > 0) {
    description += `Adjuntos:\n${task.attachments.map(a => `- ${a.name}`).join('\n')}`;
  }
  if (task.subtasks && task.subtasks.length > 0) {
    description += `\n\nSubtareas:\n${task.subtasks.map(st => `- ${st.title}`).join('\n')}`;
  }
  return description;
};

export const generateGoogleCalendarUrl = (task: Task, onboardingInfo: OnboardingInfo): string => {
  const startDate = getOnboardingStartDate(onboardingInfo); // ✅ pasar onboardingInfo
  const eventDate = getTaskDate(task, startDate);
  const formattedDate = formatDateForGoogle(eventDate);

  const details = {
    action: 'TEMPLATE',
    text: task.title,
    details: buildDescription(task),
    dates: `${formattedDate}/${formattedDate}`, // All-day event
  };

  const url = new URL('https://www.google.com/calendar/render');
  Object.keys(details).forEach(key =>
    url.searchParams.append(key, details[key as keyof typeof details])
  );

  return url.toString();
};

export const generateOutlookCalendarUrl = (task: Task, onboardingInfo: OnboardingInfo): string => {
  const startDate = getOnboardingStartDate(onboardingInfo); // ✅ pasar onboardingInfo
  const eventDate = getTaskDate(task, startDate);
  const formattedStartDate = formatDateForOutlook(eventDate);

  // For all-day events, Outlook needs the end date to be the next day.
  const endDate = new Date(eventDate);
  endDate.setDate(endDate.getDate() + 1);
  const formattedEndDate = formatDateForOutlook(endDate);

  const details = {
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: task.title,
    body: buildDescription(task),
    startdt: formattedStartDate,
    enddt: formattedEndDate,
    allday: 'true',
  };

  const url = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
  Object.keys(details).forEach(key =>
    url.searchParams.append(key, details[key as keyof typeof details])
  );

  return url.toString();
};