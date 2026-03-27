import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
  const [nome, setNome] = useState('');
  const [negocio, setNegocio] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { name: nome } }
    });

    if (error) {
       toast.error(error.message);
    } else {
       if (data.user) {
         // Insert profile
         await supabase.from('profiles').insert({
            id: data.user.id,
            nome,
            negocio,
            plano: 'pendente'
         });
         toast.success('Conta criada com sucesso!');
         navigate('/dashboard');
       }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f2f6f3] flex items-center justify-center px-6 py-10 w-full">
      <div className="w-full max-w-[400px]">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg width="36" height="44" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-syne">
            Caderneta
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Crie sua conta e comece agora</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
          <h2 className="text-xl font-bold text-gray-800 mb-6 font-syne">
            Criar conta
          </h2>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
              <input 
                required type="text" placeholder="João Silva" value={nome} onChange={e=>setNome(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do negócio</label>
              <input required type="text" placeholder="Produtos da Ana" value={negocio} onChange={e=>setNegocio(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input required type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input required type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={e=>setSenha(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]"/>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#1a9e5c] text-white rounded-xl py-3 font-semibold text-sm mt-2 active:scale-95 transition-transform flex justify-center items-center h-12">
              {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Criar conta — R$29/mês'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Ao cadastrar você concorda com nossos termos de uso
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta?{' '}
            <Link to="/login" className="text-[#1a9e5c] font-semibold hover:underline">Entrar</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
