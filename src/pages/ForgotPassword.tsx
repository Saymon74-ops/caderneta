import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://caderneta.app.br/reset-password'
    });
    
    if (error) {
      toast.error('Erro ao enviar link de recuperação. Verifique o email digitado e tente novamente.');
    } else {
      setSucesso(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f2f6f3] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        
        <div className="text-center mb-10">
          <svg width="36" height="44" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
            <rect x="0" y="0" width="72" height="88" rx="10" fill="#1a9e5c"/>
            <rect x="0" y="0" width="14" height="88" rx="10" fill="#0d7a40"/>
            <rect x="7" y="0" width="7" height="88" fill="#0d7a40"/>
            <circle cx="14" cy="18" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="14" cy="34" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="14" cy="50" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="14" cy="66" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="24" y1="30" x2="60" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <line x1="24" y1="42" x2="60" y2="42" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <line x1="24" y1="54" x2="60" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <text x="42" y="22" textAnchor="middle" fontSize="18" fontWeight="800" fill="white" fontFamily="sans-serif">C</text>
          </svg>
          <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Syne, sans-serif'}}>
            Caderneta
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Recuperação de conta</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
          {sucesso ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Syne, sans-serif'}}>Email enviado!</h2>
              <p className="text-gray-600 mb-6">
                Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada.
              </p>
              <Link to="/login" className="bg-[#1a9e5c] text-white px-6 py-3 rounded-xl font-bold inline-block hover:opacity-90">
                Voltar para o Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6" style={{fontFamily: 'Syne, sans-serif'}}>
                Esqueci minha senha
              </h2>
              
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de cadastro</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c] focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a9e5c] text-white rounded-xl py-3 font-semibold text-sm mt-2 active:scale-95 transition-transform disabled:opacity-60 flex justify-center h-12 items-center"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Enviar link de recuperação'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Lembrou a senha?{' '}
                <Link to="/login" className="text-[#1a9e5c] font-semibold hover:underline">
                  Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
