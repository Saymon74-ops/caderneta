import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      // O evento PASSWORD_RECOVERY acontece quando o usuario clica no link
      if (event == "PASSWORD_RECOVERY") {
         // O usuário foi autenticado apenas para redefinição
      }
    })
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    
    if (error) {
      toast.error('Erro ao salvar nova senha. Tente novamente.');
    } else {
      toast.success('Senha atualizada com sucesso!');
      navigate('/login');
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
          <p className="text-gray-500 mt-2 text-sm">Crie sua nova senha</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6" style={{fontFamily: 'Syne, sans-serif'}}>
            Redefinir Senha
          </h2>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a9e5c] text-white rounded-xl py-3 font-semibold text-sm mt-2 active:scale-95 transition-transform disabled:opacity-60 flex justify-center h-12 items-center"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Salvar nova senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
