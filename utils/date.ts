
import { Task, OnboardingInfo } from '../types';

export const getDateForDayAndWeek = (day: number, week: number, startDate: Date): Date => {
  const start = normalizeToBusinessDay(startDate);
  const offset = (week - 1) * 5 + (day - 1);
  return addBusinessDays(start, offset);
};

export const getTaskDate = (task: Task, onboardingStartDate: Date): Date => {
  const start = normalizeToBusinessDay(onboardingStartDate);
  const offset = (task.week - 1) * 5 + (task.day - 1);
  return addBusinessDays(start, offset);
};

export const getDayAndWeekFromDate = (targetDate: Date, onboardingStartDate: Date) => {
  const start = normalizeToBusinessDay(onboardingStartDate);
  const idx = businessDayIndexFromStart(start, targetDate);
  const week = Math.floor(idx / 5) + 1;
  const day = (idx % 5) + 1;
  return { week, day };
};

export const formatDateForDayColumn = (date: Date): string => {
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return `(${capitalizedDayName} ${day}/${month})`;
};

export function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// OJO con parseo de "YYYY-MM-DD" (timezone). Si tu onboardingStartDate es ISO:
export function parseISODateOnly(iso: string) {
  // iso: "2026-02-20"
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d); // local date (sin UTC raros)
}

export function dateFromDay(day: number, onboardingStartISO: string) {
  const start = parseISODateOnly(onboardingStartISO);
  return addDays(start, day - 1); // Día 1 = start
}

export function dayFromDate(date: Date, onboardingStartISO: string) {
  const start = parseISODateOnly(onboardingStartISO);
  const ms = date.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function getOnboardingStartDate(onboardingInfo: OnboardingInfo): Date {
  const iso = onboardingInfo.onboardingStartDate; // "YYYY-MM-DD"
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d); // evita problemas de timezone
}

// === Helpers para calendario/tablero con días hábiles (lun-vie) ===

export const isBusinessDay = (d: Date) => {
  const dow = d.getDay(); // 0 dom, 6 sáb
  return dow !== 0 && dow !== 6;
};

export const normalizeToBusinessDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  while (!isBusinessDay(d)) d.setDate(d.getDate() + 1);
  return d;
};

// Suma N días hábiles al "start" (N=0 devuelve el mismo día si es hábil)
export const addBusinessDays = (start: Date, n: number) => {
  let d = normalizeToBusinessDay(start);
  if (n <= 0) return new Date(d);

  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    if (isBusinessDay(d)) added++;
  }
  return new Date(d);
};

// Devuelve el índice de día hábil desde start hasta target.
// start => 0, siguiente hábil => 1, etc.
export const businessDayIndexFromStart = (start: Date, target: Date) => {
  const s = normalizeToBusinessDay(start);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);

  // Si target cae finde, lo normalizamos al próximo hábil
  while (!isBusinessDay(t)) t.setDate(t.getDate() + 1);

  if (t.getTime() === s.getTime()) return 0;

  // Si target es anterior a start, podés elegir clamp o permitir negativo.
  // Para tu caso (onboarding hacia adelante) clamp a 0:
  if (t.getTime() < s.getTime()) return 0;

  let idx = 0;
  const cursor = new Date(s);

  while (cursor.getTime() < t.getTime()) {
    cursor.setDate(cursor.getDate() + 1);
    if (isBusinessDay(cursor)) idx++;
  }
  return idx;
};
