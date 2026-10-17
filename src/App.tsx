import React, { useState } from 'react';
import { WorkoutProvider, useWorkouts } from './context/WorkoutContext';
import Header from './components/layout/Header';
import BottomTabBar from './components/layout/BottomTabBar';
import Footer from './components/layout/Footer';
import DailyStatsCard from './components/stats/DailyStatsCard';
import WeeklySummaryCard from './components/stats/WeeklySummaryCard';
import WorkoutList from './components/workouts/WorkoutList';
import WorkoutLogModal from './components/workouts/WorkoutLogModal';
import LiveWorkoutTracker from './components/workouts/LiveWorkoutTracker';
import AuthModal from './components/auth/AuthModal';
import SecurityAuditDrawer from './components/security/SecurityAuditDrawer';
import DromosBrand from './components/brand/DromosBrand';
import { Play, Plus, Activity, Calendar, History, Sparkles } from 'lucide-react';

function MainDashboard() {
  const { user, isLoading, workouts } = useWorkouts();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'weekly'>('dashboard');

  // Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLiveWorkoutOpen, setIsLiveWorkoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSecurityDrawerOpen, setIsSecurityDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        {/* Loading screen uses the vertical emblem */}
        <DromosBrand variant="vertical" size="lg" />
        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <div className="w-2 h-2 rounded-full bg-[#FF6700] animate-ping" />
          <span>Conectando ao Firestore seguro...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col selection:bg-[#FF6700] selection:text-white pb-20 md:pb-0">
      {/* Top Bar Contract (Horizontal Brand Logo) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenLiveWorkout={() => setIsLiveWorkoutOpen(true)}
        onOpenSecurityDrawer={() => setIsSecurityDrawerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Welcome Banner / Motivational Kicker (Nike Run style) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-[#141414] via-[#161616] to-zinc-900 border border-zinc-800/80 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#FF6700]/10 to-transparent pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 text-xs text-[#FF6700] font-athletic font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dromos Performance Lab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white uppercase font-athletic mt-0.5">
              {user ? `BOM TREINO, ${user.name.split(' ')[0]}!` : 'PREPARE-SE PARA A PRÓXIMA CORRIDA'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Cada quilômetro conta. Registre seus treinos com precisão métrica, acompanhe sua queima calórica e supere suas metas semanais.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsLiveWorkoutOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6700] hover:bg-[#ff7b1a] text-black font-athletic text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-[#FF6700]/25 active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>INICIAR AGORA</span>
            </button>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700/60 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>REGISTRAR</span>
            </button>
          </div>
        </div>

        {/* Tab-driven Content Rendering */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Today's Stats Card */}
            <DailyStatsCard
              onOpenLogModal={() => setIsLogModalOpen(true)}
              onOpenLiveWorkout={() => setIsLiveWorkoutOpen(true)}
            />

            {/* Weekly Snapshot */}
            <WeeklySummaryCard />

            {/* Recent Workouts Stream */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Últimos Treinos
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-semibold text-[#FF6700] hover:underline"
                >
                  Ver Histórico Completo ({workouts.length}) →
                </button>
              </div>
              <WorkoutList
                onOpenLogModal={() => setIsLogModalOpen(true)}
                onOpenLiveWorkout={() => setIsLiveWorkoutOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="space-y-8">
            <WeeklySummaryCard />
            <DailyStatsCard
              onOpenLogModal={() => setIsLogModalOpen(true)}
              onOpenLiveWorkout={() => setIsLiveWorkoutOpen(true)}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Histórico de Treinos
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Todas as suas sessões gravadas no banco de dados Firestore
                </p>
              </div>
            </div>
            <WorkoutList
              onOpenLogModal={() => setIsLogModalOpen(true)}
              onOpenLiveWorkout={() => setIsLiveWorkoutOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer (Text-only brand logo) */}
      <Footer onOpenSecurity={() => setIsSecurityDrawerOpen(true)} />

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenLiveWorkout={() => setIsLiveWorkoutOpen(true)}
      />

      {/* Modals & Overlays */}
      <WorkoutLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />

      <LiveWorkoutTracker
        isOpen={isLiveWorkoutOpen}
        onClose={() => setIsLiveWorkoutOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SecurityAuditDrawer
        isOpen={isSecurityDrawerOpen}
        onClose={() => setIsSecurityDrawerOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <MainDashboard />
    </WorkoutProvider>
  );
}
