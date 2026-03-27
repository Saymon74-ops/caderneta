import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    
    const installedHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setIsInstalled(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      toast.error('Email ou senha incorretos');
    } else {
      navigate('/dashboard');
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
          <p className="text-gray-500 mt-2 text-sm">Gestão simples para suas vendas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6" style={{fontFamily: 'Syne, sans-serif'}}>
            Entrar
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a9e5c] text-white rounded-xl py-3 font-semibold text-sm mt-2 active:scale-95 transition-transform disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-[#1a9e5c] font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
        
        {installPrompt && !isInstalled && (
          <div className="mt-6 bg-white border border-[#1a9e5c]/20 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#dcfce7] text-[#1a9e5c] rounded-lg flex items-center justify-center font-syne font-bold text-xl">C</div>
              <p className="text-sm font-bold text-gray-800 leading-tight">Instale o app para acesso rápido</p>
            </div>
            <button onClick={handleInstall} className="bg-[#1a9e5c] text-white px-4 py-2 rounded-lg text-xs font-bold active:scale-95 transition-transform">Instalar</button>
          </div>
        )}
        
      </div>
    </div>
  );
}
