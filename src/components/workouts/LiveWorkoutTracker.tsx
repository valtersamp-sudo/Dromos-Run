import React, { useState } from 'react';
import { useWorkouts } from '../../context/WorkoutContext';
import { WorkoutType, WORKOUT_TYPES } from '../../types/workout';
import { Play, Pause, Square, Flame, Compass, Clock, X, Check } from 'lucide-react';
import DromosBrand from '../brand/DromosBrand';

interface LiveWorkoutTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveWorkoutTracker: React.FC<LiveWorkoutTrackerProps> = ({ isOpen, onClose }) => {
  const {
    isLiveTracking,
    liveElapsedSeconds,
    liveWorkoutType,
    startLiveWorkout,
    pauseLiveWorkout,
    resumeLiveWorkout,
    stopLiveWorkout,
    isLivePaused,
    addWorkout,
  } = useWorkouts();

  const [selectedType, setSelectedType] = useState<WorkoutType>(liveWorkoutType);
  const [isFinishing, setIsFinishing] = useState(false);
  const [completedStats, setCompletedStats] = useState<{
    durationMinutes: number;
    estimatedCalories: number;
    estimatedDistanceKm: number;
  } | null>(null);

  if (!isOpen) return null;

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Live calculations
  const config = WORKOUT_TYPES[isLiveTracking ? liveWorkoutType : selectedType];
  const minutesElapsed = liveElapsedSeconds / 60;
  const liveCalories = Math.round(minutesElapsed * config.calPerMinEst);
  const liveDistance = parseFloat(((minutesElapsed / 60) * config.speedKmHAvg).toFixed(2));
  const livePace = liveDistance > 0 ? parseFloat((minutesElapsed / liveDistance).toFixed(2)) : 0;

  const handleStart = () => {
    startLiveWorkout(selectedType);
  };

  const handleStopAndSave = () => {
    const result = stopLiveWorkout();
    setCompletedStats(result);
    setIsFinishing(true);
  };

  const handleConfirmSave = async () => {
    if (!completedStats) return;
    try {
      await addWorkout({
        type: selectedType,
        title: `${config.label} Ao Vivo`,
        durationMinutes: completedStats.durationMinutes,
        caloriesBurned: completedStats.estimatedCalories,
        distanceKm: completedStats.estimatedDistanceKm,
        paceMinPerKm:
          completedStats.estimatedDistanceKm > 0
            ? parseFloat((completedStats.durationMinutes / completedStats.estimatedDistanceKm).toFixed(2))
            : 0,
        performedAt: new Date().toISOString(),
        notes: 'Treino registrado ao vivo via cronômetro Dromos Run.',
      });
      setIsFinishing(false);
      setCompletedStats(null);
      onClose();
    } catch (err) {
      console.error('Error saving live workout:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#0D0D0D] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
        {/* Subtle orange ambient glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#FF6700]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Brand Wordmark (Text variant) + Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <DromosBrand variant="favicon" size="xs" />
            <span className="font-athletic font-black italic tracking-wide text-white uppercase text-base">
              Modo Treino Ao Vivo
            </span>
          </div>

          {!isLiveTracking && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Finished Workout Modal Step */}
        {isFinishing && completedStats ? (
          <div className="my-auto py-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#FF6700]/20 text-[#FF6700] flex items-center justify-center mx-auto border border-[#FF6700]/40">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-athletic text-3xl font-black italic tracking-wider text-white uppercase">
                Treino Concluído!
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Excelente esforço! Deseja gravar esta sessão no seu histórico?
              </p>
            </div>

            {/* Recap Card */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Tempo</span>
                <div className="font-athletic text-2xl font-bold text-white tabular-nums">
                  {completedStats.durationMinutes}m
                </div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Distância</span>
                <div className="font-athletic text-2xl font-bold text-[#FF6700] tabular-nums">
                  {completedStats.estimatedDistanceKm} km
                </div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Calorias</span>
                <div className="font-athletic text-2xl font-bold text-amber-500 tabular-nums">
                  {completedStats.estimatedCalories} kcal
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsFinishing(false);
                  setCompletedStats(null);
                  onClose();
                }}
                className="w-1/2 py-3 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 rounded-xl transition-colors"
              >
                Descartar
              </button>
              <button
                onClick={handleConfirmSave}
                className="w-1/2 py-3 text-xs font-bold uppercase tracking-wider text-black bg-[#FF6700] hover:bg-[#ff7b1a] rounded-xl transition-all shadow-lg shadow-[#FF6700]/30"
              >
                Gravar Treino
              </button>
            </div>
          </div>
        ) : (
          /* Live Stopwatch & Telemetry View */
          <>
            {/* Modal Body: Exercise Category Selector (if not tracking) */}
            {!isLiveTracking && (
              <div className="mt-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  Escolha o Tipo de Corrida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(WORKOUT_TYPES) as WorkoutType[]).map(key => {
                    const cfg = WORKOUT_TYPES[key];
                    const isSelected = selectedType === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedType(key)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-zinc-800 border-[#FF6700] text-white shadow'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="font-athletic text-xs font-bold block uppercase truncate">
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {cfg.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Giant Athletic Digital Stopwatch (Nike Run aesthetic) */}
            <div className="my-auto py-8 text-center">
              <div className="text-xs uppercase tracking-widest text-zinc-400 font-medium mb-1 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6700] animate-pulse" />
                {config.label}
              </div>
              <div className="font-athletic text-6xl sm:text-7xl font-black italic tracking-tighter text-white tabular-nums drop-shadow-md">
                {formatTime(liveElapsedSeconds)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {isLiveTracking
                  ? isLivePaused
                    ? 'Treino Pausado'
                    : 'Gravando em tempo real...'
                  : 'Pronto para começar'}
              </div>

              {/* 3 Live Telemetry Blocks */}
              <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-zinc-800/80">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Distância</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-1">
                    <span className="font-athletic text-3xl font-black text-white tabular-nums">
                      {liveDistance.toFixed(2)}
                    </span>
                    <span className="font-athletic text-xs font-bold text-[#FF6700]">KM</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Calorias</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-1">
                    <span className="font-athletic text-3xl font-black text-white tabular-nums">
                      {liveCalories}
                    </span>
                    <span className="font-athletic text-xs font-bold text-amber-500">KCAL</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Ritmo Estimado</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-1">
                    <span className="font-athletic text-3xl font-black text-white tabular-nums">
                      {livePace > 0 ? livePace.toFixed(2) : '--.--'}
                    </span>
                    <span className="font-athletic text-xs font-bold text-cyan-400">/KM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Start, Pause, Resume, Stop */}
            <div className="pt-4 border-t border-zinc-900">
              {!isLiveTracking ? (
                <button
                  onClick={handleStart}
                  className="w-full h-14 rounded-2xl bg-[#FF6700] hover:bg-[#ff7b1a] text-black font-athletic text-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#FF6700]/30 active:scale-[0.98] transition-transform"
                >
                  <Play className="w-6 h-6 fill-black" />
                  <span>INICIAR CORRIDA</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {isLivePaused ? (
                    <button
                      onClick={resumeLiveWorkout}
                      className="flex-1 h-14 rounded-2xl bg-[#FF6700] hover:bg-[#ff7b1a] text-black font-athletic text-lg font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Play className="w-5 h-5 fill-black" />
                      <span>Retomar</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseLiveWorkout}
                      className="flex-1 h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-athletic text-lg font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Pause className="w-5 h-5" />
                      <span>Pausar</span>
                    </button>
                  )}

                  <button
                    onClick={handleStopAndSave}
                    className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-athletic text-lg font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-900/30"
                  >
                    <Square className="w-5 h-5 fill-current" />
                    <span>Finalizar</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveWorkoutTracker;
