import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signInDemoAthlete,
  signOutUser,
  getUserProfile,
  saveUserProfile,
  subscribeToUserWorkouts,
  addFirestoreWorkout,
  updateFirestoreWorkout,
  deleteFirestoreWorkout,
  seedSampleWorkoutsIfEmpty,
} from '../services/firebase';
import { Workout, UserProfile, DayStats, WeeklySummary, WorkoutType } from '../types/workout';

interface WorkoutContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  workouts: Workout[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dayStats: DayStats;
  weeklySummary: WeeklySummary;
  addWorkout: (data: Omit<Workout, 'id' | 'userId' | 'createdAt'>) => Promise<Workout>;
  updateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginDemo: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  // Live workout timer
  isLiveTracking: boolean;
  liveElapsedSeconds: number;
  liveWorkoutType: WorkoutType;
  startLiveWorkout: (type: WorkoutType) => void;
  pauseLiveWorkout: () => void;
  resumeLiveWorkout: () => void;
  stopLiveWorkout: () => { durationMinutes: number; estimatedCalories: number; estimatedDistanceKm: number };
  isLivePaused: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Live workout tracking state
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(0);
  const [liveWorkoutType, setLiveWorkoutType] = useState<WorkoutType>('outdoor_run');

  // Track live timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLiveTracking && !isLivePaused) {
      interval = setInterval(() => {
        setLiveElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveTracking, isLivePaused]);

  const startLiveWorkout = (type: WorkoutType) => {
    setLiveWorkoutType(type);
    setLiveElapsedSeconds(0);
    setIsLivePaused(false);
    setIsLiveTracking(true);
  };

  const pauseLiveWorkout = () => {
    setIsLivePaused(true);
  };

  const resumeLiveWorkout = () => {
    setIsLivePaused(false);
  };

  const stopLiveWorkout = () => {
    const durationMinutes = Math.max(1, Math.round(liveElapsedSeconds / 60));
    // Estimate based on workout type
    let calPerMin = 11.5;
    let avgSpeed = 10;
    if (liveWorkoutType === 'treadmill') {
      calPerMin = 10.2;
      avgSpeed = 9.5;
    } else if (liveWorkoutType === 'trail_run') {
      calPerMin = 13.0;
      avgSpeed = 8.5;
    } else if (liveWorkoutType === 'intervals') {
      calPerMin = 14.5;
      avgSpeed = 12.0;
    } else if (liveWorkoutType === 'walking') {
      calPerMin = 5.5;
      avgSpeed = 5.2;
    }
    const estimatedCalories = Math.round(durationMinutes * calPerMin);
    const estimatedDistanceKm = parseFloat(((durationMinutes / 60) * avgSpeed).toFixed(2));

    setIsLiveTracking(false);
    setIsLivePaused(false);
    setLiveElapsedSeconds(0);

    return {
      durationMinutes,
      estimatedCalories,
      estimatedDistanceKm,
    };
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          let profile = await getUserProfile(fbUser.uid);
          if (!profile) {
            profile = {
              id: fbUser.uid,
              name: fbUser.displayName || 'Atleta Dromos',
              email: fbUser.email || 'atleta@dromos.run',
              targetDailyCalories: 550,
              targetDailyDistanceKm: 7.0,
              targetWeeklyCalories: 3200,
              targetWeeklyDistanceKm: 35.0,
              role: 'athlete',
            };
            await saveUserProfile(fbUser.uid, profile);
          }
          setUser(profile);

          // Seed sample workouts if user has no data yet
          await seedSampleWorkoutsIfEmpty(fbUser.uid);
        } catch (err) {
          console.error('Error loading user profile from Firestore:', err);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setWorkouts([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to User's Workouts in Firestore
  useEffect(() => {
    if (!firebaseUser) {
      setWorkouts([]);
      return;
    }

    const unsubscribeWorkouts = subscribeToUserWorkouts(
      firebaseUser.uid,
      loadedWorkouts => {
        setWorkouts(loadedWorkouts);
      },
      err => {
        console.error('Workout subscription error:', err);
      }
    );

    return () => unsubscribeWorkouts();
  }, [firebaseUser]);

  // Auth actions
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (name = 'Alexandre Silva') => {
    setIsLoading(true);
    try {
      await signInDemoAthlete(name);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
    } finally {
      setIsLoading(false);
    }
  };

  // Workout Mutations
  const addWorkout = async (data: Omit<Workout, 'id' | 'userId' | 'createdAt'>): Promise<Workout> => {
    if (!firebaseUser) throw new Error('Usuário não autenticado');
    return await addFirestoreWorkout(firebaseUser.uid, data);
  };

  const updateWorkout = async (id: string, updates: Partial<Workout>): Promise<void> => {
    if (!firebaseUser) throw new Error('Usuário não autenticado');
    return await updateFirestoreWorkout(firebaseUser.uid, id, updates);
  };

  const deleteWorkout = async (id: string): Promise<void> => {
    if (!firebaseUser) throw new Error('Usuário não autenticado');
    return await deleteFirestoreWorkout(firebaseUser.uid, id);
  };

  // Compute Daily Stats for selectedDate
  const dayWorkouts = workouts.filter(w => w.performedAt.startsWith(selectedDate));
  const totalDayDistance = parseFloat(dayWorkouts.reduce((acc, w) => acc + (w.distanceKm || 0), 0).toFixed(2));
  const totalDayDuration = dayWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);
  const totalDayCalories = dayWorkouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
  const avgDayPace = totalDayDistance > 0 ? parseFloat((totalDayDuration / totalDayDistance).toFixed(2)) : 0;

  const dayStats: DayStats = {
    date: selectedDate,
    totalDistanceKm: totalDayDistance,
    totalDurationMin: totalDayDuration,
    totalCalories: totalDayCalories,
    workoutCount: dayWorkouts.length,
    avgPaceMinPerKm: avgDayPace,
  };

  // Compute Weekly Summary (Current rolling 7 days or Monday-Sunday)
  const now = new Date();
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weeklyDays: {
    dayOfWeek: string;
    date: string;
    distanceKm: number;
    calories: number;
    durationMin: number;
    hasWorkout: boolean;
  }[] = [];
  let weeklyDistance = 0;
  let weeklyCalories = 0;
  let weeklyDuration = 0;
  let streakDays = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = dayLabels[d.getDay()];

    const wList = workouts.filter(w => w.performedAt.startsWith(dateStr));
    const dist = wList.reduce((acc, w) => acc + (w.distanceKm || 0), 0);
    const cal = wList.reduce((acc, w) => acc + w.caloriesBurned, 0);
    const dur = wList.reduce((acc, w) => acc + w.durationMinutes, 0);

    weeklyDistance += dist;
    weeklyCalories += cal;
    weeklyDuration += dur;

    if (wList.length > 0) {
      streakDays++;
    }

    weeklyDays.push({
      dayOfWeek,
      date: dateStr,
      distanceKm: parseFloat(dist.toFixed(2)),
      calories: cal,
      durationMin: dur,
      hasWorkout: wList.length > 0,
    });
  }

  const targetWeeklyCal = user?.targetWeeklyCalories || 3200;

  const weeklySummary: WeeklySummary = {
    weekStart: weeklyDays[0].date,
    weekEnd: weeklyDays[6].date,
    days: weeklyDays,
    totalDistanceKm: parseFloat(weeklyDistance.toFixed(2)),
    totalCalories: weeklyCalories,
    totalDurationMin: weeklyDuration,
    totalWorkouts: workouts.filter(w => {
      const d = w.performedAt.split('T')[0];
      return d >= weeklyDays[0].date && d <= weeklyDays[6].date;
    }).length,
    caloriesTargetAchieved: weeklyCalories >= targetWeeklyCal,
    targetCalories: targetWeeklyCal,
    streakDays,
  };

  return (
    <WorkoutContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        workouts,
        selectedDate,
        setSelectedDate,
        dayStats,
        weeklySummary,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        loginWithGoogle,
        loginDemo,
        logout,
        isLiveTracking,
        liveElapsedSeconds,
        liveWorkoutType,
        startLiveWorkout,
        pauseLiveWorkout,
        resumeLiveWorkout,
        stopLiveWorkout,
        isLivePaused,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
};
