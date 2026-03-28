import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, DollarSign, Activity, Settings, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'metricas' | 'saques'>('metricas');
  
  const [metricas, setMetricas] = useState({
    totalProfiles: 0,
    totalAfiliados: 0,
    indicacoesAtivas: 0,
    comissoesPagas: 0
  });
  
  const [topAfiliados, setTopAfiliados] = useState<any[]>([]);
  const [saques, setSaques] = useState<any[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
      if (activeTab === 'metricas') carregarMetricas();
      else carregarSaques();
    }
  }, [user, activeTab, filtroStatus]);

  async function carregarMetricas() {
    setLoadingData(true);
    try {
      // Profiles
      const { count: countProf } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      // Afiliados
      const { count: countAf } = await supabase.from('afiliados').select('id', { count: 'exact', head: true });
      // Indicações Ativas
      const { count: countInd } = await supabase.from('indicacoes').select('id', { count: 'exact', head: true }).eq('status', 'ativo');
      // Comissões Pagas
      const { data: saquesPagos } = await supabase.from('saques').select('valor').eq('status', 'pago');
      const totalPago = saquesPagos?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;

      setMetricas({
        totalProfiles: countProf || 0,
        totalAfiliados: countAf || 0,
        indicacoesAtivas: countInd || 0,
        comissoesPagas: totalPago
      });

      // Top Afiliados
      const { data: top } = await supabase
        .from('afiliados')
        .select('*')
        .order('total_indicados', { ascending: false })
        .limit(5);
      
      setTopAfiliados(top || []);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar métricas.');
    } finally {
      setLoadingData(false);
    }
  }

  async function carregarSaques() {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('saques')
        .select('*, afiliados(nome, pix)')
        .eq('status', filtroStatus)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setSaques(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar saques.');
    } finally {
      setLoadingData(false);
    }
  }

  async function processarSaque(id: string, novoStatus: 'pago' | 'recusado') {
    try {
      const updates: any = { status: novoStatus };
      if (novoStatus === 'pago') updates.pago_em = new Date().toISOString();

      const { error } = await supabase.from('saques').update(updates).eq('id', id);
      if (error) throw error;

      toast.success(`Saque marcado como ${novoStatus}.`);
      carregarSaques();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao processar saque.');
    }
  }

  if (authLoading) return <div className="p-8 text-center">Carregando...</div>;
  
  if (!user || user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f2f6f3] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-syne font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Settings className="text-[#1a9e5c]" size={32} /> Painel Administrativo
        </h1>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('metricas')}
            className={`pb-4 px-2 font-bold transition-all ${activeTab === 'metricas' ? 'text-[#1a9e5c] border-b-2 border-[#1a9e5c]' : 'text-gray-500'}`}
          >
            Métricas Gerais
          </button>
          <button 
            onClick={() => setActiveTab('saques')}
            className={`pb-4 px-2 font-bold transition-all ${activeTab === 'saques' ? 'text-[#1a9e5c] border-b-2 border-[#1a9e5c]' : 'text-gray-500'}`}
          >
            Gestão de Saques
          </button>
        </div>

        {activeTab === 'metricas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <Users className="text-blue-500 mb-2" size={24} />
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Usuários</p>
                <p className="text-3xl font-syne font-bold">{metricas.totalProfiles}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <Users className="text-purple-500 mb-2" size={24} />
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Afiliados</p>
                <p className="text-3xl font-syne font-bold">{metricas.totalAfiliados}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <Activity className="text-emerald-500 mb-2" size={24} />
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Indicações (Ativas)</p>
                <p className="text-3xl font-syne font-bold">{metricas.indicacoesAtivas}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <DollarSign className="text-orange-500 mb-2" size={24} />
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Comissões Pagas</p>
                <p className="text-2xl font-syne font-bold">R$ {metricas.comissoesPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-syne font-bold text-gray-800 mb-4">Top 5 Afiliados</h2>
              <div className="space-y-3">
                {topAfiliados.map((af, i) => (
                  <div key={af.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">{i+1}</div>
                      <div>
                        <p className="font-bold text-gray-800">{af.nome}</p>
                        <p className="text-xs text-gray-500">Código: {af.codigo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1a9e5c]">{af.total_indicados} indicações</p>
                      <p className="text-xs text-gray-500">R$ {Number(af.total_ganho).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} gerados</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saques' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex gap-2 mb-6">
              {['pendente', 'pago', 'recusado'].map(status => (
                <button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors ${filtroStatus === status ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>

            {loadingData ? (
               <div className="text-center py-8 text-gray-400">Carregando saques...</div>
            ) : saques.length === 0 ? (
               <div className="text-center py-8 text-gray-400">Nenhum saque {filtroStatus}.</div>
            ) : (
              <div className="space-y-4">
                {saques.map(sq => (
                  <div key={sq.id} className="border border-gray-100 p-4 rounded-2xl md:flex md:justify-between md:items-center">
                    <div className="mb-4 md:mb-0">
                      <p className="font-bold text-gray-900 text-lg">{sq.afiliados?.nome}</p>
                      <p className="text-gray-500 text-sm">Pix: <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{sq.pix}</span></p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="font-syne font-bold text-orange-600">R$ {Number(sq.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className="text-xs text-gray-400">{new Date(sq.criado_em).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    {filtroStatus === 'pendente' && (
                      <div className="flex gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => processarSaque(sq.id, 'pago')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-[#1a9e5c] hover:bg-[#166534] text-white px-4 py-2 rounded-xl font-bold uppercase text-xs transition-colors"
                        >
                          <CheckCircle2 size={16} /> Pago
                        </button>
                        <button 
                          onClick={() => processarSaque(sq.id, 'recusado')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-xl font-bold uppercase text-xs transition-colors"
                        >
                          <XCircle size={16} /> Recusar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
