
import React from 'react';
import type { View } from '../types';
import { NewHireIcon, LeaderIcon, AdminIcon } from './Icons';
import { BrandLogo } from './BrandLogo';
import logoBa from '../assets/logoba.png';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  icon: React.ReactNode;
  currentView: View;
  onClick: (view: View) => void;
}> = ({ view, label, icon, currentView, onClick }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-brand-cyan text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col p-4 shadow-lg z-10">
      <div className="flex items-center space-x-2 mb-8 px-2">
        <BrandLogo imgSrc={logoBa} iconClassName="w-8 h-8" textClassName="text-white text-xl" />
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem
          view="newHire"
          label="Vista Ingresante"
          icon={<NewHireIcon />}
          currentView={currentView}
          onClick={onViewChange}
        />
        <NavItem
          view="leader"
          label="Vista Líder"
          icon={<LeaderIcon />}
          currentView={currentView}
          onClick={onViewChange}
        />
        <NavItem
          view="admin"
          label="Vista Administrador"
          icon={<AdminIcon />}
          currentView={currentView}
          onClick={onViewChange}
        />
      </nav>
      <div className="mt-auto text-center text-xs text-slate-400">
        <p>Versión 1.0.0</p>
      </div>
    </div>
  );
};
