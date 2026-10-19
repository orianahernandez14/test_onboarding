
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, AnalyticsIcon, TeamIcon, DocumentIcon, UserIcon, LeaderIcon, AdminIcon, ManagerIcon } from './Icons';
import { BrandLogo } from './BrandLogo';
import { AppMode, View } from '../types';
import logo from '../assets/logo.png';
import footerLogo from '../assets/logoba.png';
import { API_URL } from "../services/api";

interface LandingPageProps {
  onStartApp: (
    mode: AppMode,
    initialView: View,
    profileId?: string | null,
    profileIds?: string[]
  ) => void;
}

interface LoginModalProps {
  role: View;
  onClose: () => void;
  onConfirm: (username: string, password: string) => void;
  error: string | null;
}

const LoginModal: React.FC<LoginModalProps> = ({
  role,
  onClose,
  onConfirm,
  error,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const roleLabels: Record<View, string> = {
    newHire: 'Ingresante',
    leader: 'Líder / Mentor',
    admin: 'Administrador',
  };

  const rolePlaceholders: Record<View, string> = {
    newHire: 'ID / CUIL del ingresante',
    leader: 'ID / CUIL del líder',
    admin: 'administrador',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(username, password);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-slate-800 font-heading">
              Acceso {roleLabels[role]}
            </h3>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Usuario
              </label>

              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
                placeholder={rolePlaceholders[role]}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
                placeholder="usuario + oba"
              />

              {error && (
                <p className="mt-2 text-xs text-red-500 font-bold">
                  {error}
                </p>
              )}
            </div>

            {/* Ayuda MVP */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700">Acceso piloto:</span>{' '}
                utilizar ID/CUIL como usuario y contraseña con formato{' '}
                <span className="font-black text-brand-cyan">
                  usuario + oba
                </span>
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Ejemplo: 27123456789 → 27123456789oba
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-[2] px-4 py-3 rounded-xl text-sm font-bold text-white bg-brand-cyan hover:bg-brand-cyan/80 active:scale-95 transition-all"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStartApp }) => {
  const [selectedRole, setSelectedRole] = useState<View | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const handleRoleClick = (role: View) => {
    setSelectedRole(role);
    setLoginError(null);
  };

  const handleLoginConfirm = async (
    username: string,
    password: string
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            role: selectedRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setLoginError("Usuario o contraseña incorrectos.");
        return;
      }

      onStartApp("isolated", data.role, data.profileId, data.profileIds);

    } catch (error) {
      console.error(error);
      setLoginError("No se pudo validar el acceso.");
    }
  };
  
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header con fondo institucional #153244 */}
      {selectedRole && (
        <LoginModal
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
          onConfirm={handleLoginConfirm}
          error={loginError}
        />
      )}
      <nav className="bg-brand-navy border-b border-white/10 w-full sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <BrandLogo 
                imgSrc={logo}
                alt="Logo RH"            
                iconClassName="h-16 w-auto"
                withText={false}
                variant="light"
              />
            </div>
            
            <div className="flex items-center gap-4">
               <button
                 data-tour="landing-demo" 
                 onClick={() => onStartApp('demo', 'leader')} 
                 className="bg-white/10 text-white border border-white/20 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-bold hover:bg-white/20 transition-all active:scale-95 text-sm whitespace-nowrap"
               >
                  Explorar Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold font-heading tracking-tight text-slate-900 mb-8 leading-tight">
            Navegador de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-navy to-brand-cyan">Onboarding GCBA</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-12">
            Gestión de la integración y cultura en equipos del Gobierno de la Ciudad de Buenos Aires.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16 px-4">
              <button 
                data-tour="landing-ingresante"
                onClick={() => handleRoleClick('newHire')}
                className="group p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-brand-cyan transition-all shadow-sm hover:shadow-xl flex flex-col items-center gap-4"
              >
                  <div className="w-16 h-16 bg-brand-cyan/10 text-brand-navy rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserIcon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                      <h3 className="font-bold text-brand-navy">Soy Ingresante</h3>
                      <p className="text-xs text-brand-grey mt-1">Ver mi plan de las primeras semanas</p>
                  </div>
              </button>

              <button 
                data-tour="landing-lider"
                onClick={() => handleRoleClick('leader')}
                className="group p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-brand-cyan transition-all shadow-sm hover:shadow-xl flex flex-col items-center gap-4"
              >
                  <div className="w-16 h-16 bg-brand-cyan/10 text-brand-navy rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ManagerIcon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                      <h3 className="font-bold text-brand-navy">Soy Líder / Mentor</h3>
                      <p className="text-xs text-brand-grey mt-1">Gestionar ingresos de mi equipo</p>
                  </div>
              </button>

              <button 
                data-tour="landing-admin"
                onClick={() => handleRoleClick('admin')}
                className="group p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-brand-cyan transition-all shadow-sm hover:shadow-xl flex flex-col items-center gap-4"
              >
                  <div className="w-16 h-16 bg-brand-cyan/10 text-brand-navy rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AdminIcon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                      <h3 className="font-bold text-brand-navy">Soy Administrador</h3>
                      <p className="text-xs text-brand-grey mt-1">Visión global de la prueba piloto</p>
                  </div>
              </button>
          </div>
          
          <div className="mt-16 relative mx-auto max-w-5xl px-4">
            <div className="rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:rounded-2xl lg:p-4">
              <div className="rounded-lg bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80" alt="App Preview" className="w-full opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="py-24 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-brand-navy font-bold tracking-widest uppercase text-xs mb-2">Prueba Piloto</h2>
            <p className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl font-heading">
              Enfoque en Cultura y Experiencia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="bg-brand-cyan/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-brand-navy">
                <CheckCircleIcon />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3 font-heading">Integración Cultural</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Visualiza el ingreso día a día con tareas personalizadas que refuerzan los valores y procesos del equipo.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="bg-brand-cyan/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-brand-navy">
                <TeamIcon />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3 font-heading">Mentoreo Directo</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Asignación clara de referentes y compañeros para asegurar que nadie comience su camino en soledad.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="bg-brand-cyan/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-brand-navy">
                <AnalyticsIcon />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3 font-heading">Métricas de Piloto</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Seguimiento en tiempo real del progreso de los nuevos ingresos para optimizar la experiencia de bienvenida.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-brand-navy text-white/60 py-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <BrandLogo 
              imgSrc={footerLogo}
              alt="Logo BA Desde Adentro"
              iconClassName="h-12 w-auto"
              withText={false}
              variant="light" 
            />
            
            <p className="text-xs max-w-xs text-center md:text-left leading-relaxed">
              Subsecretaría de Gestión de Recursos Humanos<br />
              Gobierno de la Ciudad de Buenos Aires
            </p>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Prueba Piloto 2026
          </div>

        </div>
      </footer>
    </div>
  );
};
