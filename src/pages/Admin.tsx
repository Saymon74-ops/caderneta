import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Settings, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  
  const [metricas, setMetricas] = useState({
    totalProfiles: 0
  });
  


  useEffect(() => {
    if (user && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
      carregarMetricas();
    }
  }, [user]);

  async function carregarMetricas() {
    try {
      const { count: countProf } = await supabase.from('profiles').select('id', { count: 'exact', head: true });

      setMetricas({
        totalProfiles: countProf || 0
      });
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar métricas.');
    }
  }

  if (authLoading) return <div className="p-8 text-center">Carregando...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f6f3] p-4 text-center">
        <XCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-syne font-bold text-gray-900 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6 font-medium">Você não tem permissão para acessar o painel administrativo.</p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="bg-[#1a9e5c] hover:bg-[#166534] text-white px-6 py-3 rounded-full font-bold transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f6f3] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-syne font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Settings className="text-[#1a9e5c]" size={32} /> Painel Administrativo
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <Users className="text-blue-500 mb-2" size={24} />
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Usuários</p>
              <p className="text-3xl font-syne font-bold">{metricas.totalProfiles}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
