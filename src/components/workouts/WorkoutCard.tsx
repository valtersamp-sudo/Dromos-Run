import React, { useState } from 'react';
import { Workout, WORKOUT_TYPES } from '../../types/workout';
import { Flame, Clock, Compass, Heart, Trash2, MapPin } from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';

interface WorkoutCardProps {
  workout: Workout;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout }) => {
  const { deleteWorkout } = useWorkouts();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const config = WORKOUT_TYPES[workout.type] || WORKOUT_TYPES.outdoor_run;

  const workoutDate = new Date(workout.performedAt);
  const formattedDate = workoutDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkout(workout.id);
    } catch (err) {
      console.error('Failed to delete workout:', err);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="group bg-[#141414] hover:bg-[#181818] border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl overflow-hidden transition-all duration-200 shadow-md flex flex-col md:flex-row">
      {/* Illustrative Exercise Image Cover with Measured Scrim */}
      <div className="relative md:w-56 h-40 md:h-auto shrink-0 overflow-hidden bg-zinc-900">
        <img
          src={config.image}
          alt={config.label}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Contrast Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Floating Category Text (Clean unboxed title) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="font-athletic text-sm font-bold tracking-wider uppercase text-[#FF6700]">
            {config.label}
          </span>
          <span className="text-xs text-zinc-300 font-mono">
            {config.tag}
          </span>
        </div>
      </div>

      {/* Main Content & Telemetry */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Unboxed clean text with separators */}
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span>{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span>{config.subtitle}</span>
            </div>

            {/* Delete Control */}
            <div className="flex items-center gap-1">
              {showConfirm ? (
                <div className="flex items-center gap-1 bg-red-950/80 border border-red-800/80 rounded px-2 py-0.5">
                  <span className="text-[11px] text-red-300">Excluir?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs text-red-200 hover:text-white font-bold px-1"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 px-1"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-zinc-500 hover:text-red-400 rounded transition-opacity"
                  title="Excluir treino"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Workout Title */}
          <h3 className="text-lg font-bold text-white tracking-tight mt-1.5 line-clamp-1">
            {workout.title}
          </h3>

          {/* Notes if provided */}
          {workout.notes && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 italic">
              "{workout.notes}"
            </p>
          )}
        </div>

        {/* 4-Item Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-3 border-t border-zinc-800/80">
          {/* Metric 1: Distance */}
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Distância</span>
            <div className="flex items-baseline gap-0.5 mt-0.5">
              <span className="font-athletic text-2xl font-black text-white tabular-nums">
                {workout.distanceKm !== undefined && workout.distanceKm > 0
                  ? workout.distanceKm.toFixed(2)
                  : '—'}
              </span>
              <span className="font-athletic text-xs font-bold text-[#FF6700]">KM</span>
            </div>
          </div>

          {/* Metric 2: Duration */}
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Duração</span>
            <div className="flex items-baseline gap-0.5 mt-0.5">
              <span className="font-athletic text-2xl font-black text-white tabular-nums">
                {workout.durationMinutes}
              </span>
              <span className="font-athletic text-xs font-bold text-zinc-400">MIN</span>
            </div>
          </div>

          {/* Metric 3: Calories */}
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Calorias</span>
            <div className="flex items-baseline gap-0.5 mt-0.5">
              <span className="font-athletic text-2xl font-black text-white tabular-nums">
                {workout.caloriesBurned}
              </span>
              <span className="font-athletic text-xs font-bold text-amber-500">KCAL</span>
            </div>
          </div>

          {/* Metric 4: Pace or Heart Rate */}
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Ritmo (Pace)</span>
            <div className="flex items-baseline gap-0.5 mt-0.5">
              <span className="font-athletic text-2xl font-black text-white tabular-nums">
                {workout.paceMinPerKm && workout.paceMinPerKm > 0
                  ? workout.paceMinPerKm.toFixed(2)
                  : "--'--"}
              </span>
              <span className="font-athletic text-xs font-bold text-cyan-400">/KM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
