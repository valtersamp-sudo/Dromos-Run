import { Workout, UserProfile, DayStats, WeeklySummary } from '../types/workout';

const TOKEN_KEY = 'dromos_auth_token';
const USER_KEY = 'dromos_auth_user';

export interface SecurityAuditItem {
  id: string;
  name: string;
  status: 'Pass' | 'Fail';
  details: string;
}

export interface SecurityAuditResponse {
  status: string;
  timestamp: string;
  protections: SecurityAuditItem[];
}

export class ApiService {
  private static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public static setAuth(token: string, user: UserProfile) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth to localStorage:', e);
    }
  }

  public static clearAuth() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear auth from localStorage:', e);
    }
  }

  public static getStoredUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // If unauthorized, token is expired or invalid
      this.clearAuth();
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Erro HTTP ${response.status}`);
    }

    return data as T;
  }

  // Auth APIs
  public static async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const res = await this.request<{ user: UserProfile; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  public static async register(name: string, email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const res = await this.request<{ user: UserProfile; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  public static async switchDemoUser(email: string): Promise<{ user: UserProfile; token: string }> {
    const res = await this.request<{ user: UserProfile; token: string }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  public static async getCurrentUser(): Promise<UserProfile> {
    const res = await this.request<{ user: UserProfile }>('/api/auth/me');
    return res.user;
  }

  // Workouts APIs
  public static async getWorkouts(): Promise<Workout[]> {
    const res = await this.request<{ workouts: Workout[] }>('/api/workouts');
    return res.workouts;
  }

  public static async createWorkout(data: Omit<Workout, 'id' | 'userId' | 'createdAt'>): Promise<Workout> {
    const res = await this.request<{ workout: Workout }>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.workout;
  }

  public static async updateWorkout(id: string, data: Partial<Workout>): Promise<Workout> {
    const res = await this.request<{ workout: Workout }>(`/api/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.workout;
  }

  public static async deleteWorkout(id: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/api/workouts/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  }

  // Statistics APIs
  public static async getDailyStats(date?: string): Promise<DayStats & { targetCalories: number; targetDistanceKm: number; workouts: Workout[] }> {
    const url = date ? `/api/stats/daily?date=${date}` : '/api/stats/daily';
    return await this.request<DayStats & { targetCalories: number; targetDistanceKm: number; workouts: Workout[] }>(url);
  }

  public static async getWeeklySummary(): Promise<WeeklySummary & { targetDistanceKm: number; caloriesProgressPercent: number }> {
    return await this.request<WeeklySummary & { targetDistanceKm: number; caloriesProgressPercent: number }>('/api/stats/weekly');
  }

  // Security Audit
  public static async getSecurityAudit(): Promise<SecurityAuditResponse> {
    return await this.request<SecurityAuditResponse>('/api/security/audit');
  }
}
