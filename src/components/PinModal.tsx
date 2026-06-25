import { useState } from 'react';

interface PinModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const CORRECT_PIN = '318314';

export default function PinModal({ onSuccess, onClose }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (pin === CORRECT_PIN) {
      onSuccess();
    } else {
      setPin('');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[22px] bg-white shadow-2xl border border-[#e8d8bc] p-6">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#e9c978] to-[#b47d21] mx-auto mb-3 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-[#2a1f0f]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-['Cormorant_Garamond'] text-[22px] font-bold text-[#2b2016] mb-1">
            Hall da Daiane
          </h3>
          <p className="text-[13px] text-[#7a6750]">Digite a senha para acessar</p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="••••••"
          autoFocus
          maxLength={6}
          className={`w-full text-center text-[22px] tracking-[0.3em] font-bold rounded-xl border-2 border-[#e0cfb2] bg-[#fffcf7] px-4 py-3.5 outline-none focus:border-[#c9a05f] focus:ring-4 focus:ring-[#f5ebce]/40 mb-4 transition ${
            shake ? 'border-red-400 animate-[shake_.4s_ease]' : ''
          }`}
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#e1cfb3] bg-white px-4 py-2.5 text-[13.5px] font-bold text-[#6a5842] hover:bg-[#faf7f0]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#e8c674] to-[#ba7d24] px-4 py-2.5 text-[13.5px] font-extrabold text-[#2b2015] shadow-sm hover:brightness-105"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
