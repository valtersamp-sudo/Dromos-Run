import React, { useState } from 'react';
import { useWorkouts } from '../../context/WorkoutContext';
import { WorkoutCard } from './WorkoutCard';
import { WorkoutType, WORKOUT_TYPES } from '../../types/workout';
import { Filter, Search, Plus, Play, Dumbbell } from 'lucide-react';

interface WorkoutListProps {
  onOpenLogModal: () => void;
  onOpenLiveWorkout: () => void;
}

export const WorkoutList: React.FC<WorkoutListProps> = ({
  onOpenLogModal,
  onOpenLiveWorkout,
}) => {
  const { workouts } = useWorkouts();
  const [selectedFilter, setSelectedFilter] = useState<WorkoutType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'distance' | 'calories' | 'duration'>('recent');

  // Filter & Search Logic
  const filteredWorkouts = workouts
    .filter(w => {
      if (selectedFilter !== 'all' && w.type !== selectedFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = w.title.toLowerCase().includes(q);
        const matchNotes = w.notes ? w.notes.toLowerCase().includes(q) : false;
        return matchTitle || matchNotes;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return (b.distanceKm || 0) - (a.distanceKm || 0);
      if (sortBy === 'calories') return b.caloriesBurned - a.caloriesBurned;
      if (sortBy === 'duration') return b.durationMinutes - a.durationMinutes;
      // Default: recent
      return new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime();
    });

  const categories: { id: WorkoutType | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'outdoor_run', label: 'Corrida de Rua' },
    { id: 'treadmill', label: 'Esteira Indoor' },
    { id: 'trail_run', label: 'Trilha' },
    { id: 'intervals', label: 'Tiros & HIIT' },
    { id: 'walking', label: 'Caminhada' },
  ];

  return (
    <div className="space-y-5">
      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou anotação..."
            className="w-full bg-[#141414] border border-zinc-800 text-white placeholder-zinc-500 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#FF6700] transition-colors"
          />
        </div>

        {/* Sort Dropdown & Action CTA */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#141414] border border-zinc-800 text-xs font-medium text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FF6700] transition-colors"
          >
            <option value="recent">Mais Recentes</option>
            <option value="distance">Maior Distância</option>
            <option value="calories">Mais Calorias</option>
            <option value="duration">Maior Duração</option>
          </select>

          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-black bg-[#FF6700] hover:bg-[#ff7b1a] rounded-xl transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips / Tabs (Functional Interactive Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => {
          const isActive = selectedFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Workouts Feed */}
      {filteredWorkouts.length > 0 ? (
        <div className="space-y-4">
          {filteredWorkouts.map(workout => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#141414] border border-zinc-800/80 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
            <Dumbbell className="w-8 h-8 text-[#FF6700]" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Nenhum treino encontrado
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mt-1 mb-6">
            {searchQuery || selectedFilter !== 'all'
              ? 'Tente ajustar os filtros de categoria ou termo de busca acima.'
              : 'Você ainda não registrou nenhum treino nesta conta. Comece agora!'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenLiveWorkout}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-[#FF6700] hover:bg-[#ff7b1a] rounded-xl transition-all shadow-lg shadow-[#FF6700]/20"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Iniciar Treino Ao Vivo</span>
            </button>
            <button
              onClick={onOpenLogModal}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Manualmente</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutList;
