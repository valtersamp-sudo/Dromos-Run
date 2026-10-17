import React from 'react';
import DromosBrand from '../brand/DromosBrand';
import { Database, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenSecurity: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSecurity }) => {
  return (
    <footer className="mt-16 border-t border-zinc-900 bg-[#0A0A0A] py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand Zone: Text-only variant to avoid glyph duplication with header */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <DromosBrand variant="text" size="sm" />
          <span className="text-xs text-zinc-500 mt-1">
            Plataforma de alta performance para corredores e atletas
          </span>
        </div>

        {/* Quiet Meta Links & Security Status */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Database className="w-3.5 h-3.5 text-[#FF6700]" />
            <span>Firebase Firestore</span>
          </div>
          <span aria-hidden="true">·</span>
          <button
            onClick={onOpenSecurity}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Auditoria de Segurança</span>
          </button>
          <span aria-hidden="true">·</span>
          <span>© 2026 Dromos Run</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
