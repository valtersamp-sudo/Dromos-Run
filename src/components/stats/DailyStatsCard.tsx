import React from 'react';
import { useWorkouts } from '../../context/WorkoutContext';
import { Flame, Clock, Compass, Zap, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DailyStatsCardProps {
  onOpenLogModal: () => void;
  onOpenLiveWorkout: () => void;
}

export const DailyStatsCard: React.FC<DailyStatsCardProps> = ({
  onOpenLogModal,
  onOpenLiveWorkout,
}) => {
  const { user, dayStats, selectedDate, setSelectedDate, weeklySummary } = useWorkouts();

  // Date navigation helpers
  const handlePrevDay = () => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Formatted date string in Portuguese
  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Calculate target progress percentage
  const targetCalories = user?.targetDailyCalories || 550;
  const calPercent = Math.min(100, Math.round((dayStats.totalCalories / targetCalories) * 100));

  const targetDistance = user?.targetDailyDistanceKm || 7.0;
  const distPercent = Math.min(100, Math.round((dayStats.totalDistanceKm / targetDistance) * 100));

  // Circular progress SVG metrics (radius 48, stroke 8)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  return (
    <div className="bg-[#141414] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Subtle background athletic angle watermark */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#FF6700]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header: Date Navigator & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CalendarIcon className="w-3.5 h-3.5 text-[#FF6700]" />
            <span className="capitalize">{formattedDate}</span>
            {isToday && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#FF6700] font-semibold">Hoje</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Estatísticas do Dia
          </h2>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-zinc-900/90 border border-zinc-800 rounded-lg p-1">
          <button
            onClick={handlePrevDay}
            title="Dia anterior"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isToday ? (
            <button
              onClick={handleSetToday}
              className="px-2.5 py-1 text-xs font-medium text-[#FF6700] hover:text-white hover:bg-zinc-800 rounded transition-colors"
            >
              Ir para Hoje
            </button>
          ) : (
            <span className="px-2 text-xs font-medium text-zinc-300">Hoje</span>
          )}
          <button
            onClick={handleNextDay}
            title="Próximo dia"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Stats Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left: Big Hero Metric with Circular Progress Indicator */}
        <div className="lg:col-span-5 flex items-center gap-5">
          {/* Radial progress ring */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 110 110">
              {/* Track */}
              <circle
                cx="55"
                cy="55"
                r={radius}
                className="text-zinc-800/80 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress */}
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke="#FF6700"
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-athletic text-2xl font-black text-white leading-none">
                {calPercent}%
              </span>
              <span className="text-[10px] text-zinc-400 tracking-wider uppercase mt-0.5">Meta</span>
            </div>
          </div>

          {/* Hero Numbers */}
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Distância Total</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-athletic text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                {dayStats.totalDistanceKm > 0 ? dayStats.totalDistanceKm.toFixed(1) : '0.0'}
              </span>
              <span className="font-athletic text-lg font-bold text-[#FF6700]">KM</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
              <span>{dayStats.workoutCount} {dayStats.workoutCount === 1 ? 'treino' : 'treinos'}</span>
              <span aria-hidden="true">·</span>
              <span>Meta: {targetDistance} km</span>
            </div>
          </div>
        </div>

        {/* Right: 3 Key Supporting Telemetry Cards */}
        <div className="lg:col-span-7 grid grid-cols-3 gap-3">
          {/* Card 1: Calorias Queimadas */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="truncate">Calorias</span>
              <Flame className="w-4 h-4 text-[#FF6700] shrink-0" />
            </div>
            <div className="mt-2">
              <div className="font-athletic text-2xl font-black text-white tabular-nums leading-none">
                {dayStats.totalCalories}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 truncate">
                de {targetCalories} kcal
              </div>
            </div>
          </div>

          {/* Card 2: Duração Ativa */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="truncate">Tempo Ativo</span>
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="mt-2">
              <div className="font-athletic text-2xl font-black text-white tabular-nums leading-none">
                {dayStats.totalDurationMin}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                minutos
              </div>
            </div>
          </div>

          {/* Card 3: Ritmo Médio (Pace) */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="truncate">Pace Médio</span>
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="mt-2">
              <div className="font-athletic text-2xl font-black text-white tabular-nums leading-none">
                {dayStats.avgPaceMinPerKm > 0 ? `${dayStats.avgPaceMinPerKm.toFixed(2)}` : "--'--"}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                /km
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Action Bar */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Zap className="w-3.5 h-3.5 text-[#FF6700]" />
          <span>Sequência atual: <strong className="text-white">{weeklySummary.streakDays} dias</strong> treinados na semana</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLogModal}
            className="px-3 py-1.5 font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap"
          >
            + Registrar Treino
          </button>
          <button
            onClick={onOpenLiveWorkout}
            className="px-3 py-1.5 font-semibold text-black bg-[#FF6700] hover:bg-[#ff7b1a] rounded-lg transition-colors whitespace-nowrap"
          >
            Iniciar Corrida
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyStatsCard;
