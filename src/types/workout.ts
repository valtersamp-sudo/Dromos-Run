export type WorkoutType = 
  | 'outdoor_run' 
  | 'treadmill' 
  | 'trail_run' 
  | 'intervals' 
  | 'walking';

export interface Workout {
  id: string;
  userId: string;
  type: WorkoutType;
  title: string;
  durationMinutes: number;
  caloriesBurned: number;
  distanceKm?: number;
  paceMinPerKm?: number;
  heartRateAvg?: number;
  performedAt: string; // ISO string YYYY-MM-DDTHH:mm:ss
  notes?: string;
  createdAt: string;
}

export interface WorkoutTypeConfig {
  id: WorkoutType;
  label: string;
  subtitle: string;
  image: string;
  calPerMinEst: number;
  speedKmHAvg: number;
  tag: string;
}

export const WORKOUT_TYPES: Record<WorkoutType, WorkoutTypeConfig> = {
  outdoor_run: {
    id: 'outdoor_run',
    label: 'Corrida de Rua',
    subtitle: 'Asfalto, estrada e parques ao ar livre',
    image: '/src/assets/images/outdoor_run_exercise_1792251847168.jpg',
    calPerMinEst: 11.5,
    speedKmHAvg: 10.0,
    tag: 'Road',
  },
  treadmill: {
    id: 'treadmill',
    label: 'Esteira Indoor',
    subtitle: 'Ambiente controlado e treino indoor',
    image: '/src/assets/images/treadmill_workout_exercise_1792251847819.jpg',
    calPerMinEst: 10.2,
    speedKmHAvg: 9.5,
    tag: 'Indoor',
  },
  trail_run: {
    id: 'trail_run',
    label: 'Corrida em Trilha',
    subtitle: 'Terrenos mistos, altimetria e natureza',
    image: '/src/assets/images/trail_run_exercise_1792251848667.jpg',
    calPerMinEst: 13.0,
    speedKmHAvg: 8.5,
    tag: 'Trail',
  },
  intervals: {
    id: 'intervals',
    label: 'Tiros & Intervalados',
    subtitle: 'Alta intensidade e ganho de velocidade (HIIT)',
    image: '/src/assets/images/sprint_intervals_exercise_1792251848397.jpg',
    calPerMinEst: 14.5,
    speedKmHAvg: 12.5,
    tag: 'Speed',
  },
  walking: {
    id: 'walking',
    label: 'Caminhada & Recuperação',
    subtitle: 'Regenerativo, base aeróbica e caminhada rápida',
    image: '/src/assets/images/trail_run_exercise_1792251848667.jpg', // reusable natural high quality landscape
    calPerMinEst: 5.5,
    speedKmHAvg: 5.2,
    tag: 'Recovery',
  },
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetDailyCalories: number;
  targetDailyDistanceKm: number;
  targetWeeklyCalories: number;
  targetWeeklyDistanceKm: number;
  role: 'athlete' | 'coach';
}

export interface DayStats {
  date: string;
  totalDistanceKm: number;
  totalDurationMin: number;
  totalCalories: number;
  workoutCount: number;
  avgPaceMinPerKm: number;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  days: {
    dayOfWeek: string; // 'Seg', 'Ter', etc.
    date: string;
    distanceKm: number;
    calories: number;
    durationMin: number;
    hasWorkout: boolean;
  }[];
  totalDistanceKm: number;
  totalCalories: number;
  totalDurationMin: number;
  totalWorkouts: number;
  caloriesTargetAchieved: boolean;
  targetCalories: number;
  streakDays: number;
}
