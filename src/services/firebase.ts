import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Workout, UserProfile } from '../types/workout';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test Firestore Connection on Boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Error Handling Definition
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (error) {
    console.error('Google Sign In failed:', error);
    throw error;
  }
}

export async function signInDemoAthlete(athleteName = 'Alexandre Silva'): Promise<FirebaseUser> {
  try {
    const cred = await signInAnonymously(auth);
    // Initialize user profile in Firestore
    await saveUserProfile(cred.user.uid, {
      id: cred.user.uid,
      name: athleteName,
      email: `${athleteName.toLowerCase().replace(/\s+/g, '.')}@dromos.run`,
      targetDailyCalories: 550,
      targetDailyDistanceKm: 7.0,
      targetWeeklyCalories: 3200,
      targetWeeklyDistanceKm: 35.0,
      role: 'athlete',
    });
    return cred.user;
  } catch (error) {
    console.error('Anonymous/Demo sign in failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

// User Profile Operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const existing = await getDoc(userRef);
    const payload = {
      ...profile,
      id: userId,
      createdAt: existing.exists() ? existing.data()?.createdAt : new Date().toISOString(),
    };
    await setDoc(userRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Workouts Operations
export function subscribeToUserWorkouts(
  userId: string,
  onWorkouts: (workouts: Workout[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = `users/${userId}/workouts`;
  const q = query(collection(db, 'users', userId, 'workouts'), orderBy('performedAt', 'desc'));

  return onSnapshot(
    q,
    snapshot => {
      const workouts: Workout[] = [];
      snapshot.forEach(docSnap => {
        workouts.push(docSnap.data() as Workout);
      });
      onWorkouts(workouts);
    },
    error => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addFirestoreWorkout(
  userId: string,
  data: Omit<Workout, 'id' | 'userId' | 'createdAt'>
): Promise<Workout> {
  const workoutId = `wkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/workouts/${workoutId}`;

  const fullWorkout: Workout = {
    ...data,
    id: workoutId,
    userId,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', userId, 'workouts', workoutId), fullWorkout);
    return fullWorkout;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateFirestoreWorkout(
  userId: string,
  workoutId: string,
  updates: Partial<Workout>
): Promise<void> {
  const path = `users/${userId}/workouts/${workoutId}`;
  try {
    const docRef = doc(db, 'users', userId, 'workouts', workoutId);
    // Don't allow changing immutable fields
    const { id, userId: uId, createdAt, ...allowedUpdates } = updates;
    await updateDoc(docRef, allowedUpdates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreWorkout(userId: string, workoutId: string): Promise<void> {
  const path = `users/${userId}/workouts/${workoutId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Seed sample workouts for an athlete if their workout collection is empty
export async function seedSampleWorkoutsIfEmpty(userId: string): Promise<void> {
  const path = `users/${userId}/workouts`;
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'workouts'));
    if (!snapshot.empty) return; // Already has workouts!

    const now = new Date();
    const daysAgo = (days: number, hours = 7, minutes = 15) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    };

    const initialWorkouts: Omit<Workout, 'id' | 'userId' | 'createdAt'>[] = [
      {
        type: 'outdoor_run',
        title: 'Corrida Matinal no Parque',
        durationMinutes: 42,
        caloriesBurned: 495,
        distanceKm: 8.2,
        paceMinPerKm: 5.12,
        heartRateAvg: 154,
        performedAt: daysAgo(0, 6, 30),
        notes: 'Ritmo constante no asfalto com ótima cadência.',
      },
      {
        type: 'treadmill',
        title: 'Esteira Indoor - Ritmo Limiar',
        durationMinutes: 35,
        caloriesBurned: 390,
        distanceKm: 6.5,
        paceMinPerKm: 5.38,
        heartRateAvg: 162,
        performedAt: daysAgo(1, 18, 0),
        notes: 'Aquecimento 10 min + 5x (3 min a 12 km/h + 1 min trote leve).',
      },
      {
        type: 'intervals',
        title: 'Tiros de Velocidade 400m na Pista',
        durationMinutes: 28,
        caloriesBurned: 375,
        distanceKm: 5.0,
        paceMinPerKm: 4.45,
        heartRateAvg: 172,
        performedAt: daysAgo(2, 7, 0),
        notes: '8 séries fortes com foco em explosão e amplitude de passada.',
      },
      {
        type: 'trail_run',
        title: 'Trilha da Serra - Altimetria',
        durationMinutes: 65,
        caloriesBurned: 780,
        distanceKm: 10.4,
        paceMinPerKm: 6.25,
        heartRateAvg: 158,
        performedAt: daysAgo(3, 8, 15),
        notes: 'Subidas técnicas e descidas controladas. Ganho de elevação de 320m.',
      },
      {
        type: 'walking',
        title: 'Caminhada Regenerativa',
        durationMinutes: 40,
        caloriesBurned: 210,
        distanceKm: 3.8,
        paceMinPerKm: 10.5,
        heartRateAvg: 108,
        performedAt: daysAgo(5, 17, 30),
        notes: 'Foco em desintoxicação muscular e mobilidade ativa.',
      },
      {
        type: 'outdoor_run',
        title: 'Longão de Domingo 14K',
        durationMinutes: 72,
        caloriesBurned: 890,
        distanceKm: 14.1,
        paceMinPerKm: 5.1,
        heartRateAvg: 149,
        performedAt: daysAgo(6, 6, 0),
        notes: 'Treino longo aeróbico da semana com hidratação a cada 4km.',
      },
    ];

    for (const w of initialWorkouts) {
      await addFirestoreWorkout(userId, w);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
