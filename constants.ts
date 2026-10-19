
import React from 'react';
import { TaskType } from './types';
import { MeetingIcon, SetupIcon, ReadingIcon, OperationalIcon } from './components/Icons';

export const DAYS = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5'];

export const TASK_TYPE_STYLES: { [key in TaskType]: { icon: React.ReactNode; color: string; } } = {
  [TaskType.MEETING]: {
    icon: React.createElement(MeetingIcon),
    color: 'border-l-sky-500 bg-sky-500/10',
  },
  [TaskType.SETUP]: {
    icon: React.createElement(SetupIcon),
    color: 'border-l-amber-500 bg-amber-500/10',
  },
  [TaskType.READING]: {
    icon: React.createElement(ReadingIcon),
    color: 'border-l-emerald-500 bg-emerald-500/10',
  },
  [TaskType.OPERATIONAL]: {
    icon: React.createElement(OperationalIcon),
    color: 'border-l-violet-500 bg-violet-500/10',
  },
};
