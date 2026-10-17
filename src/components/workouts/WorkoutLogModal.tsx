import React, { useState } from 'react';
import { useWorkouts } from '../../context/WorkoutContext';
import { WorkoutType, WORKOUT_TYPES } from '../../types/workout';
import { X, Flame, Clock, Compass, Heart, Calendar, Check } from 'lucide-react';

interface WorkoutLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({ isOpen, onClose }) => {
  const { addWorkout } = useWorkouts();

  const [type, setType] = useState<WorkoutType>('outdoor_run');
  const [title, setTitle] = useState('Corrida de Rua');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [distanceKm, setDistanceKm] = useState<number>(5.0);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(345);
  const [heartRateAvg, setHeartRateAvg] = useState<number | ''>(150);
  const [notes, setNotes] = useState('');
  const [performedAt, setPerformedAt] = useState<string>(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle changing exercise type: update title suggestion and calorie estimate
  const handleTypeSelect = (selected: WorkoutType) => {
    setType(selected);
    const config = WORKOUT_TYPES[selected];
    setTitle(config.label);
    const estimatedCal = Math.round(durationMinutes * config.calPerMinEst);
    setCaloriesBurned(estimatedCal);
  };

  // Recalculate estimated calories when duration changes
  const handleDurationChange = (minutes: number) => {
    const val = Math.max(1, Math.min(1440, minutes));
    setDurationMinutes(val);
    const config = WORKOUT_TYPES[type];
    const estimatedCal = Math.round(val * config.calPerMinEst);
    setCaloriesBurned(estimatedCal);
  };

  // Calculated pace: minutes / km
  const calculatedPace =
    distanceKm > 0 && durationMinutes > 0
      ? parseFloat((durationMinutes / distanceKm).toFixed(2))
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (durationMinutes <= 0) {
      setErrorMsg('A duração do treino deve ser maior que 0 minutos.');
      return;
    }
    if (caloriesBurned <= 0) {
      setErrorMsg('As calorias queimadas devem ser maiores que 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addWorkout({
        type,
        title: title.trim() || WORKOUT_TYPES[type].label,
        durationMinutes,
        caloriesBurned,
        distanceKm: distanceKm > 0 ? distanceKm : 0,
        paceMinPerKm: calculatedPace,
        heartRateAvg: heartRateAvg ? Number(heartRateAvg) : undefined,
        performedAt: new Date(performedAt).toISOString(),
        notes: notes.trim() || undefined,
      });

      onClose();
    } catch (err: any) {
      console.error('Error logging workout:', err);
      setErrorMsg(err.message || 'Erro ao registrar treino. Verifique a conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#141414] border border-zinc-800 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#141414]/95 backdrop-blur-md z-10 px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black italic tracking-wide text-white uppercase font-athletic">
              Registrar Treino
            </h2>
            <p className="text-xs text-zinc-400">
              Grave sua sessão de corrida no banco de dados Dromos Run
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Exercise Type Selection with illustrative cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Selecione a Modalidade
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(WORKOUT_TYPES) as WorkoutType[]).map(tKey => {
                const config = WORKOUT_TYPES[tKey];
                const isSelected = type === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => handleTypeSelect(tKey)}
                    className={`relative rounded-xl overflow-hidden border text-left transition-all group ${
                      isSelected
                        ? 'border-[#FF6700] ring-2 ring-[#FF6700]/30 shadow-md'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="h-16 relative bg-zinc-900 overflow-hidden">
                      <img
                        src={config.image}
                        alt={config.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#FF6700] text-black flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    {/* Card Label */}
                    <div className="p-2 bg-zinc-900/90">
                      <span className="font-athletic text-xs font-bold text-white block truncate uppercase">
                        {config.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {config.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Título do Treino
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Treino Noturno no Asfalto"
              maxLength={100}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6700] transition-colors"
            />
          </div>

          {/* Metrics Grid: Duration, Distance, Calories, Pace */}
          <div className="grid grid-cols-2 gap-4">
            {/* Duração */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Duração (min)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={durationMinutes}
                onChange={e => handleDurationChange(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-athletic text-xl font-bold tabular-nums focus:outline-none focus:border-[#FF6700] transition-colors"
                required
              />
            </div>

            {/* Distância */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> Distância (km)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="500"
                value={distanceKm}
                onChange={e => setDistanceKm(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-athletic text-xl font-bold tabular-nums focus:outline-none focus:border-[#FF6700] transition-colors"
              />
            </div>

            {/* Calorias Queimadas */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <Flame className="w-3.5 h-3.5 text-[#FF6700]" /> Calorias (kcal)
              </label>
              <input
                type="number"
                min="1"
                max="15000"
                value={caloriesBurned}
                onChange={e => setCaloriesBurned(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-athletic text-xl font-bold tabular-nums focus:outline-none focus:border-[#FF6700] transition-colors"
                required
              />
            </div>

            {/* Ritmo Calculado (Live Pace) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Pace Calculado (/km)
              </label>
              <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-athletic text-xl font-bold tabular-nums flex items-center justify-between">
                <span>{calculatedPace > 0 ? calculatedPace.toFixed(2) : '--.--'}</span>
                <span className="text-xs text-zinc-500 font-normal">min/km</span>
              </div>
            </div>
          </div>

          {/* Date & Heart Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF6700]" /> Data e Horário
              </label>
              <input
                type="datetime-local"
                value={performedAt}
                onChange={e => setPerformedAt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF6700] transition-colors"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Frequência Cardíaca (BPM)
              </label>
              <input
                type="number"
                min="40"
                max="240"
                value={heartRateAvg}
                onChange={e => setHeartRateAvg(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Ex: 155 (opcional)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#FF6700] transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Anotações & Sensações (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Sensação de esforço, percurso, clima, tênis utilizado..."
              rows={2}
              maxLength={500}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF6700] transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-[#FF6700] hover:bg-[#ff7b1a] rounded-xl transition-all shadow-lg shadow-[#FF6700]/25 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Treino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutLogModal;
