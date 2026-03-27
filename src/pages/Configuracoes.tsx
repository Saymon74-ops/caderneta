import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, LogOut, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Configuracoes() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [negocio, setNegocio] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '');
      setNegocio(profile.negocio || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ nome, negocio }).eq('id', user.id);
    
    if (error) {
      toast.error('Erro ao salvar perfil!');
    } else {
      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senha || senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    
    if (error) {
      toast.error('Erro ao alterar senha: ' + error.message);
    } else {
      toast.success('Senha alterada com sucesso!');
      setSenha('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="p-4 min-h-screen bg-[#f2f6f3] pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-syne font-bold text-gray-800">Configurações</h1>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <h2 className="font-syne font-bold text-lg mb-4 text-gray-800">Dados do Perfil</h2>
          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
              <input 
                type="text" 
                className="input-field bg-gray-50 border-gray-200" 
                value={nome} 
                onChange={e => setNome(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Negócio</label>
              <input 
                type="text" 
                className="input-field bg-gray-50 border-gray-200" 
                value={negocio} 
                onChange={e => setNegocio(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary py-3 flex items-center justify-center gap-2">
              <Save size={18} /> Salvar Perfil
            </button>
          </form>
        </div>

        <div className="card p-5">
          <h2 className="font-syne font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
            <Key size={20} className="text-gray-500" /> Segurança
          </h2>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nova Senha</label>
              <input 
                type="password" 
                className="input-field bg-gray-50 border-gray-200" 
                placeholder="Mínimo 6 caracteres"
                value={senha} 
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gray-800 text-white py-3 px-4 rounded-xl font-bold border active:bg-gray-700 transition-colors">
              Alterar Senha
            </button>
          </form>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
        >
          <LogOut size={20} /> Sair do Aplicativo
        </button>
      </div>
    </div>
  );
}
