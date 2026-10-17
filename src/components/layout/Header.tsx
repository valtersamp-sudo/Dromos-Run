import React from 'react';
import DromosBrand from '../brand/DromosBrand';
import { useWorkouts } from '../../context/WorkoutContext';
import { ShieldCheck, Plus, LogOut, Flame, Play } from 'lucide-react';

interface HeaderProps {
  onOpenLogModal: () => void;
  onOpenLiveWorkout: () => void;
  onOpenSecurityDrawer: () => void;
  onOpenAuthModal: () => void;
  activeTab: 'dashboard' | 'history' | 'weekly';
  setActiveTab: (tab: 'dashboard' | 'history' | 'weekly') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogModal,
  onOpenLiveWorkout,
  onOpenSecurityDrawer,
  onOpenAuthModal,
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useWorkouts();

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Horizontal variant - runner glyph on left + DROMOS RUN on right) */}
        <div className="flex items-center gap-3">
          <DromosBrand variant="horizontal" size="sm" />
        </div>

        {/* Zone 2: Navigation Links (Clean unboxed single-line typography with hover underlines) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'dashboard'
                ? 'text-white border-b-2 border-[#FF6700] font-semibold'
                : 'hover:text-white'
            }`}
          >
            Painel do Dia
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'weekly'
                ? 'text-white border-b-2 border-[#FF6700] font-semibold'
                : 'hover:text-white'
            }`}
          >
            Resumo Semanal
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'history'
                ? 'text-white border-b-2 border-[#FF6700] font-semibold'
                : 'hover:text-white'
            }`}
          >
            Histórico
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Workout Button (Nike Run Club style) */}
          <button
            onClick={onOpenLiveWorkout}
            title="Iniciar Treino Ao Vivo"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-[#FF6700] hover:bg-[#ff7b1a] rounded-lg transition-all active:scale-95 shadow-md shadow-[#FF6700]/20 whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">Treino Ao Vivo</span>
            <span className="sm:hidden">Iniciar</span>
          </button>

          {/* New Workout Log Button */}
          <button
            onClick={onOpenLogModal}
            title="Registrar Treino Manual"
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Registrar</span>
          </button>

          {/* Security & Database Status Trigger */}
          <button
            onClick={onOpenSecurityDrawer}
            title="Auditoria de Segurança & Banco de Dados"
            className="min-h-[38px] min-w-[38px] flex items-center justify-center text-zinc-400 hover:text-emerald-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </button>

          {/* User Account / Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-zinc-800">
              <button
                onClick={onOpenAuthModal}
                title={`Conectado como ${user.name}`}
                className="flex items-center gap-2 text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-600 flex items-center justify-center font-athletic text-sm font-bold text-white group-hover:border-[#FF6700] transition-colors">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
              <button
                onClick={logout}
                title="Desconectar"
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
