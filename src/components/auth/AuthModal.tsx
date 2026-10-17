import React, { useState } from 'react';
import { useWorkouts } from '../../context/WorkoutContext';
import DromosBrand from '../brand/DromosBrand';
import { X, LogOut, Check, UserCheck, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGoogle, loginDemo, logout } = useWorkouts();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google login error:', err);
      setErrorMsg(err.message || 'Falha ao autenticar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (name: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginDemo(name);
      onClose();
    } catch (err: any) {
      console.error('Demo login error:', err);
      setErrorMsg(err.message || 'Falha ao conectar perfil demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141414] border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Hero - Vertical Variant (Runner Glyph centered on top + Wordmark below) */}
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <DromosBrand variant="vertical" size="lg" />
          <p className="text-xs text-zinc-400 mt-3 max-w-xs">
            Rastreamento de treinos de alta performance integrado ao Firebase Firestore.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        {user ? (
          /* Logged In View */
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-athletic text-xl font-bold text-[#FF6700]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-athletic text-base font-bold text-white block truncate uppercase">
                  {user.name}
                </span>
                <span className="text-xs text-zinc-400 block truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Autenticado</span>
              </div>
            </div>

            {/* Target Goals Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
                <span className="text-zinc-500 block">Meta Diária</span>
                <span className="font-athletic text-lg font-bold text-white block mt-0.5">
                  {user.targetDailyCalories} kcal / {user.targetDailyDistanceKm} km
                </span>
              </div>
              <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
                <span className="text-zinc-500 block">Meta Semanal</span>
                <span className="font-athletic text-lg font-bold text-white block mt-0.5">
                  {user.targetWeeklyCalories} kcal / {user.targetWeeklyDistanceKm} km
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="w-full py-2.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar Conta</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Options View */
          <div className="space-y-4">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            <div className="flex items-center gap-3 my-2 text-zinc-600 text-xs">
              <div className="flex-1 border-t border-zinc-800" />
              <span>ou perfis demonstrativos</span>
              <div className="flex-1 border-t border-zinc-800" />
            </div>

            {/* Quick Demo Athletes for testing */}
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('Alexandre Silva')}
                disabled={loading}
                className="w-full p-3 text-left rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-athletic text-xs font-bold text-white block uppercase group-hover:text-[#FF6700] transition-colors">
                    Alexandre Silva
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Maratonista · 6 treinos gravados
                  </span>
                </div>
                <UserCheck className="w-4 h-4 text-[#FF6700]" />
              </button>

              <button
                onClick={() => handleDemoLogin('Beatriz Lima')}
                disabled={loading}
                className="w-full p-3 text-left rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-athletic text-xs font-bold text-white block uppercase group-hover:text-[#FF6700] transition-colors">
                    Beatriz Lima
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Treinadora & Velocista · Perfil isolado
                  </span>
                </div>
                <UserCheck className="w-4 h-4 text-[#FF6700]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
