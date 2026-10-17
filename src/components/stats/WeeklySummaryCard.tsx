import React, { useState } from 'react';
import { useWorkouts } from '../../context/WorkoutContext';
import { Trophy, TrendingUp, Calendar, Zap } from 'lucide-react';

export const WeeklySummaryCard: React.FC = () => {
  const { weeklySummary, selectedDate, setSelectedDate, user } = useWorkouts();
  const [metricMode, setMetricMode] = useState<'distance' | 'calories'>('distance');

  // Max value calculation for bar heights
  const maxDistance = Math.max(...weeklySummary.days.map(d => d.distanceKm), 10);
  const maxCalories = Math.max(...weeklySummary.days.map(d => d.calories), 600);

  const targetWeeklyCal = user?.targetWeeklyCalories || 3200;
  const targetWeeklyDist = user?.targetWeeklyDistanceKm || 35.0;

  const calProgress = Math.min(100, Math.round((weeklySummary.totalCalories / targetWeeklyCal) * 100));
  const distProgress = Math.min(100, Math.round((weeklySummary.totalDistanceKm / targetWeeklyDist) * 100));

  return (
    <div className="bg-[#141414] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-[#FF6700]" />
            <span>Últimos 7 dias</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> {weeklySummary.streakDays} dias ativos
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Resumo Semanal
          </h2>
        </div>

        {/* Interactive Segmented Switcher for Metric (Functional interactive tabs) */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('distance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              metricMode === 'distance'
                ? 'bg-[#FF6700] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Distância (km)
          </button>
          <button
            onClick={() => setMetricMode('calories')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              metricMode === 'calories'
                ? 'bg-[#FF6700] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Calorias (kcal)
          </button>
        </div>
      </div>

      {/* 7-Day Interactive Activity Histogram */}
      <div className="mt-6">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-40 pt-4 pb-2 border-b border-zinc-800/60">
          {weeklySummary.days.map(day => {
            const isSelected = selectedDate === day.date;
            const value = metricMode === 'distance' ? day.distanceKm : day.calories;
            const maxValue = metricMode === 'distance' ? maxDistance : maxCalories;
            const heightPercent = Math.max(8, Math.round((value / maxValue) * 100));

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`group flex flex-col items-center justify-end h-full focus:outline-none transition-all rounded-lg p-1.5 ${
                  isSelected ? 'bg-zinc-800/60 ring-1 ring-[#FF6700]' : 'hover:bg-zinc-900/50'
                }`}
                title={`${day.dayOfWeek} (${day.date}): ${day.distanceKm} km | ${day.calories} kcal`}
              >
                {/* Bar Value Tooltip / Label */}
                <span className="text-[10px] font-mono tabular-nums text-zinc-400 group-hover:text-white mb-1 transition-colors">
                  {value > 0 ? (metricMode === 'distance' ? value.toFixed(1) : value) : '—'}
                </span>

                {/* Vertical Bar */}
                <div className="w-full max-w-[28px] bg-zinc-800/80 rounded-t-md relative overflow-hidden flex items-end h-28">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isSelected
                        ? 'bg-[#FF6700]'
                        : day.hasWorkout
                        ? 'bg-gradient-to-t from-orange-600 to-[#FF6700] group-hover:brightness-110'
                        : 'bg-zinc-800'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Day of Week Label */}
                <span
                  className={`text-xs font-athletic tracking-wider mt-2 ${
                    isSelected ? 'text-[#FF6700] font-bold' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {day.dayOfWeek}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly KPI Breakdown (4-column strip) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-2">
        {/* KPI 1 */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
          <span className="text-xs text-zinc-400 font-medium">Distância Total</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-athletic text-3xl font-black text-white tabular-nums">
              {weeklySummary.totalDistanceKm.toFixed(1)}
            </span>
            <span className="font-athletic text-sm font-bold text-[#FF6700]">KM</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Meta: {targetWeeklyDist} km ({distProgress}%)
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
          <span className="text-xs text-zinc-400 font-medium">Calorias Queimadas</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-athletic text-3xl font-black text-white tabular-nums">
              {weeklySummary.totalCalories}
            </span>
            <span className="font-athletic text-sm font-bold text-amber-500">KCAL</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Meta: {targetWeeklyCal} kcal ({calProgress}%)
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
          <span className="text-xs text-zinc-400 font-medium">Tempo de Corrida</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-athletic text-3xl font-black text-white tabular-nums">
              {Math.floor(weeklySummary.totalDurationMin / 60)}h {weeklySummary.totalDurationMin % 60}m
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Tempo ativo acumulado
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
          <span className="text-xs text-zinc-400 font-medium">Sessões Realizadas</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-athletic text-3xl font-black text-white tabular-nums">
              {weeklySummary.totalWorkouts}
            </span>
            <span className="font-athletic text-sm font-bold text-emerald-400">TREINOS</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Consistência atlética
          </div>
        </div>
      </div>

      {/* Weekly Goal Progress Bar */}
      <div className="mt-5 p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#FF6700]" />
            Meta Semanal de Desempenho
          </span>
          <span className="font-athletic font-bold text-white tabular-nums">
            {calProgress}% concluída
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-[#FF6700] rounded-full transition-all duration-700"
            style={{ width: `${calProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryCard;
