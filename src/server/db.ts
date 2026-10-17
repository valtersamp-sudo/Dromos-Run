import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth.ts';

export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  targetDailyCalories: number;
  targetDailyDistanceKm: number;
  targetWeeklyCalories: number;
  targetWeeklyDistanceKm: number;
  role: 'athlete' | 'coach';
  createdAt: string;
}

export interface DBWorkout {
  id: string;
  userId: string;
  type: 'outdoor_run' | 'treadmill' | 'trail_run' | 'intervals' | 'walking';
  title: string;
  durationMinutes: number;
  caloriesBurned: number;
  distanceKm: number;
  paceMinPerKm: number;
  heartRateAvg?: number;
  performedAt: string;
  notes?: string;
  createdAt: string;
}

interface DatabaseSchema {
  version: number;
  users: DBUser[];
  workouts: DBWorkout[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'dromos_database.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    version: 1,
    users: [],
    workouts: [],
  };
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.isLoaded = true;
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing database file, recreating memory baseline:', err);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    // Athlete 1: Alexandre Silva (Runner)
    const pass1 = hashPassword('dromos2026');
    const alexandre: DBUser = {
      id: 'usr_alexandre_01',
      name: 'Alexandre Silva',
      email: 'alexandre@dromos.run',
      passwordHash: pass1.hash,
      salt: pass1.salt,
      targetDailyCalories: 550,
      targetDailyDistanceKm: 7.0,
      targetWeeklyCalories: 3200,
      targetWeeklyDistanceKm: 35.0,
      role: 'athlete',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    // Athlete 2: Beatriz Lima (Coach & Runner)
    const pass2 = hashPassword('dromos2026');
    const beatriz: DBUser = {
      id: 'usr_beatriz_02',
      name: 'Beatriz Lima',
      email: 'beatriz@dromos.run',
      passwordHash: pass2.hash,
      salt: pass2.salt,
      targetDailyCalories: 450,
      targetDailyDistanceKm: 6.0,
      targetWeeklyCalories: 2800,
      targetWeeklyDistanceKm: 28.0,
      role: 'athlete',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    };

    this.data.users = [alexandre, beatriz];

    // Seed realistic recent workouts for Alexandre
    const now = new Date();
    const workouts: DBWorkout[] = [];

    // Helper to generate a date offset in days from today
    const daysAgo = (days: number, hours = 7, minutes = 15) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    };

    // Today's workout: Morning Outdoor 8K
    workouts.push({
      id: 'wkt_001_today',
      userId: alexandre.id,
      type: 'outdoor_run',
      title: 'Corrida Matinal no Parque',
      durationMinutes: 42,
      caloriesBurned: 495,
      distanceKm: 8.2,
      paceMinPerKm: 5.12,
      heartRateAvg: 154,
      performedAt: daysAgo(0, 6, 30),
      notes: 'Ritmo constante e respiração fluida. Ótima sensação térmica.',
      createdAt: daysAgo(0, 7, 15),
    });

    // Yesterday's workout: Treadmill intervals
    workouts.push({
      id: 'wkt_002_yesterday',
      userId: alexandre.id,
      type: 'treadmill',
      title: 'Esteira Indoor - Ritmo Limiar',
      durationMinutes: 35,
      caloriesBurned: 390,
      distanceKm: 6.5,
      paceMinPerKm: 5.38,
      heartRateAvg: 162,
      performedAt: daysAgo(1, 18, 0),
      notes: 'Aquecimento 10 min + 5x (3 min a 12 km/h + 1 min trote leve).',
      createdAt: daysAgo(1, 18, 40),
    });

    // 2 days ago: Speed intervals
    workouts.push({
      id: 'wkt_003_intervals',
      userId: alexandre.id,
      type: 'intervals',
      title: 'Tiros de Velocidade 400m na Pista',
      durationMinutes: 28,
      caloriesBurned: 375,
      distanceKm: 5.0,
      paceMinPerKm: 4.45,
      heartRateAvg: 172,
      performedAt: daysAgo(2, 7, 0),
      notes: '8 séries de 400m em ritmo forte com recuperação ativa de 90s.',
      createdAt: daysAgo(2, 7, 30),
    });

    // 3 days ago: Trail run
    workouts.push({
      id: 'wkt_004_trail',
      userId: alexandre.id,
      type: 'trail_run',
      title: 'Trilha da Serra - Altimetria',
      durationMinutes: 65,
      caloriesBurned: 780,
      distanceKm: 10.4,
      paceMinPerKm: 6.25,
      heartRateAvg: 158,
      performedAt: daysAgo(3, 8, 15),
      notes: 'Subidas técnicas e descidas controladas. Ganho de elevação de 320m.',
      createdAt: daysAgo(3, 9, 30),
    });

    // 5 days ago: Recovery walk
    workouts.push({
      id: 'wkt_005_walk',
      userId: alexandre.id,
      type: 'walking',
      title: 'Caminhada Regenerativa',
      durationMinutes: 40,
      caloriesBurned: 210,
      distanceKm: 3.8,
      paceMinPerKm: 10.5,
      heartRateAvg: 108,
      performedAt: daysAgo(5, 17, 30),
      notes: 'Foco em desintoxicação muscular e mobilidade.',
      createdAt: daysAgo(5, 18, 15),
    });

    // 6 days ago: Long weekend run
    workouts.push({
      id: 'wkt_006_long',
      userId: alexandre.id,
      type: 'outdoor_run',
      title: 'Longão de Domingo 14K',
      durationMinutes: 72,
      caloriesBurned: 890,
      distanceKm: 14.1,
      paceMinPerKm: 5.1,
      heartRateAvg: 149,
      performedAt: daysAgo(6, 6, 0),
      notes: 'Treino longo aeróbico da semana. Hidratação a cada 4km.',
      createdAt: daysAgo(6, 7, 20),
    });

    // Seed a couple workouts for Beatriz (demonstrating strict isolation)
    workouts.push({
      id: 'wkt_beatriz_001',
      userId: beatriz.id,
      type: 'outdoor_run',
      title: 'Treino Rodagem Beatriz',
      durationMinutes: 45,
      caloriesBurned: 440,
      distanceKm: 7.5,
      paceMinPerKm: 6.0,
      heartRateAvg: 152,
      performedAt: daysAgo(0, 8, 0),
      notes: 'Treino individual da Beatriz.',
      createdAt: daysAgo(0, 8, 50),
    });

    this.data.workouts = workouts;
  }

  private persist() {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to atomically write DB file:', err);
    }
  }

  // --- User Operations ---
  public getUserByEmail(email: string): DBUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): DBUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<DBUser, 'id' | 'createdAt'>): DBUser {
    const newUser: DBUser = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  // --- Workouts Operations (Enforcing strict userId isolation) ---
  public getWorkoutsForUser(userId: string): DBWorkout[] {
    return this.data.workouts
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  public getWorkoutById(id: string): DBWorkout | undefined {
    return this.data.workouts.find(w => w.id === id);
  }

  public createWorkout(workout: Omit<DBWorkout, 'id' | 'createdAt'>): DBWorkout {
    const newWorkout: DBWorkout = {
      ...workout,
      id: `wkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.workouts.unshift(newWorkout);
    this.persist();
    return newWorkout;
  }

  public updateWorkout(
    workoutId: string,
    userId: string,
    updates: Partial<Omit<DBWorkout, 'id' | 'userId' | 'createdAt'>>
  ): DBWorkout | null {
    const index = this.data.workouts.findIndex(w => w.id === workoutId && w.userId === userId);
    if (index === -1) return null;

    const existing = this.data.workouts[index];
    const updated: DBWorkout = {
      ...existing,
      ...updates,
      id: existing.id,
      userId: existing.userId, // immutable owner
      createdAt: existing.createdAt, // immutable creation
    };

    this.data.workouts[index] = updated;
    this.persist();
    return updated;
  }

  public deleteWorkout(workoutId: string, userId: string): boolean {
    const index = this.data.workouts.findIndex(w => w.id === workoutId && w.userId === userId);
    if (index === -1) return false;

    this.data.workouts.splice(index, 1);
    this.persist();
    return true;
  }
}

export const dbStore = new DatabaseStore();
