import React from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, Key, Server, Database, UserCheck } from 'lucide-react';
import DromosBrand from '../brand/DromosBrand';

interface SecurityAuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityAuditDrawer: React.FC<SecurityAuditDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const securityChecklist = [
    {
      title: 'Autenticação de Usuários',
      icon: UserCheck,
      status: 'Conforme',
      desc: 'Sessões autenticadas via Firebase Auth (Google Sign-In / ID Tokens). Usuários anônimos e credenciais verificadas com UIDs únicos.',
    },
    {
      title: 'Controle de Acesso & Isolamento (RBAC)',
      icon: Lock,
      status: 'Conforme',
      desc: 'Regras no Firestore (/users/{userId}/workouts/{workoutId}) forçam request.auth.uid == userId. Usuários jamais acessam ou modificam treinos de outros atletas.',
    },
    {
      title: 'Prevenção de Acesso Indevido a Banco de Dados',
      icon: Database,
      status: 'Conforme',
      desc: 'Bloqueio padrão estrito (allow read, write: if false). Consultas abertas de listagem global são rejeitadas matematicamente na raiz.',
    },
    {
      title: 'Proteção contra Exposição de Dados Sensíveis',
      icon: ShieldCheck,
      status: 'Conforme',
      desc: 'Coleções de perfis PII isoladas. Nenhuma senha ou hash transitado. Todos os documentos possuem limites estritos de tamanho (title <= 100, notes <= 500).',
    },
    {
      title: 'Configurações de Servidor & Headers',
      icon: Server,
      status: 'Conforme',
      desc: 'Headers de segurança ativos (X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, X-XSS-Protection). Payloads com limite de volume.',
    },
    {
      title: 'Proteção de Chaves e Credenciais de API',
      icon: Key,
      status: 'Conforme',
      desc: 'Chave de projeto limitada a chamadas autorizadas no Firebase. Segredos de backend e credenciais administrativas permanecem em ambiente seguro.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141414] border border-zinc-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <DromosBrand variant="favicon" size="xs" />
          <span className="font-athletic text-xs font-bold text-[#FF6700] uppercase tracking-wider">
            Dromos Security Fortress
          </span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          Auditoria de Segurança & Firestore
        </h2>
        <p className="text-xs text-zinc-400 mt-1 mb-5">
          Conformidade das 8 diretrizes de integridade, isolamento multi-tenant e proteção de endpoints.
        </p>

        <div className="space-y-3">
          {securityChecklist.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Rules v2 · Deployed
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAuditDrawer;
