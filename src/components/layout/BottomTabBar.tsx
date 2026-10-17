import React from 'react';
import { Activity, Calendar, History, Plus, Play } from 'lucide-react';
import DromosBrand from '../brand/DromosBrand';

interface BottomTabBarProps {
  activeTab: 'dashboard' | 'history' | 'weekly';
  setActiveTab: (tab: 'dashboard' | 'history' | 'weekly') => void;
  onOpenLogModal: () => void;
  onOpenLiveWorkout: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onOpenLiveWorkout,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 transition-all">
      <div className="grid grid-cols-5 items-center justify-items-center h-14">
        {/* Tab 1: Painel do Dia */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            activeTab === 'dashboard' ? 'text-[#FF6700]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Hoje</span>
        </button>

        {/* Tab 2: Resumo Semanal */}
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            activeTab === 'weekly' ? 'text-[#FF6700]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Semana</span>
        </button>

        {/* Central Action: Live Workout Run (Nike Run Style) */}
        <button
          onClick={onOpenLiveWorkout}
          className="flex flex-col items-center justify-center -mt-4 bg-[#FF6700] hover:bg-[#ff7b1a] text-black w-12 h-12 rounded-full shadow-lg shadow-[#FF6700]/30 active:scale-95 transition-transform"
          title="Iniciar Treino Ao Vivo"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>

        {/* Tab 3: Registrar */}
        <button
          onClick={onOpenLogModal}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Registrar Treino"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Registrar</span>
        </button>

        {/* Tab 4: Histórico */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            activeTab === 'history' ? 'text-[#FF6700]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Histórico</span>
        </button>
      </div>
    </div>
  );
};

export default BottomTabBar;
