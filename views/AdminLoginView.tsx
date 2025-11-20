"use client";

import { Lock } from "lucide-react";

interface AdminLoginViewProps {
  email: string;
  password: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onLogin: () => void;
  onBack: () => void;
}

export default function AdminLoginView({
  email,
  password,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onBack,
}: AdminLoginViewProps) {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 animate-in zoom-in">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl border-4 border-red-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-900">
            <Lock className="text-red-900" size={32} />
          </div>
          <h2 className="text-2xl font-black text-red-900">ADMIN LOGIN</h2>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Admin"
            className="w-full p-3 bg-amber-50 rounded-xl border-2 border-amber-200 outline-none font-bold text-red-900"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-amber-50 rounded-xl border-2 border-amber-200 outline-none font-bold text-red-900"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />
          <button
            onClick={onLogin}
            disabled={isLoading}
            className="w-full bg-red-900 text-amber-400 py-3 rounded-xl font-black hover:bg-red-800 transition"
          >
            {isLoading ? "LOADING..." : "MASUK"}
          </button>
          <button
            onClick={onBack}
            className="w-full text-xs font-bold text-red-900/50 hover:text-red-900"
          >
            KEMBALI KE MENU
          </button>
        </div>
      </div>
    </div>
  );
}

