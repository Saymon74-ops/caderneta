import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, TrendingUp, AlertCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    faturamentoMes: 0,
    lucroReal: 0,
    totalFiado: 0,
    vendasHoje: 0,
    recebidoHoje: 0,
    despesasHoje: 0
  });

  const [inadimplentes, setInadimplentes] = useState<any[]>([]);
  const [ultimasVendas, setUltimasVendas] = useState<any[]>([]);
  
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

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
    
    if (localStorage.getItem('pwa_banner_dismissed') === 'true') {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleDismissInstall = () => {
    localStorage.setItem('pwa_banner_dismissed', 'true');
    setShowInstallBanner(false);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setIsInstalled(true);
  };

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const hoje = new Date();
        const mesInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
        
        hoje.setHours(0,0,0,0);
        // Corrige fuso pra bater com strings do banco truncadas
        const hojeTZ = new Date(hoje.getTime() - (hoje.getTimezoneOffset() * 60000)).toISOString();
        const hojeStr = hojeTZ.split('T')[0];

        // 1. Vendas do Mes
        const { data: vendasMes } = await supabase.from('vendas').select('id, total').gte('data_venda', mesInicio);
        const fatMes = vendasMes?.reduce((acc, v) => acc + Number(v.total), 0) || 0;

        // 2. Lucro Real
        let lucro = 0;
        if (vendasMes && vendasMes.length > 0) {
          const vendasIds = vendasMes.map(v => v.id);
          // Dividir em chunks caso sejam muitas vendas (limite length da URL no in)
          // Mas como eh MVP, a query in() direto atende as primeiras centenas de registros.
          const { data: itensMes } = await supabase.from('itens_venda').select('quantidade, preco_unitario, custo_unitario').in('venda_id', vendasIds);
          lucro = itensMes?.reduce((acc, idx) => acc + ((Number(idx.preco_unitario) - Number(idx.custo_unitario)) * Number(idx.quantidade)), 0) || 0;
        }

        // 3. Total Fiado Aberto
        const { data: fiadosAbertos } = await supabase.from('fiados').select('valor_restante').neq('status', 'pago');
        const fiadoTot = fiadosAbertos?.reduce((acc, f) => acc + Number(f.valor_restante), 0) || 0;

        // 4. Vendas Hoje
        const { count: countVendas } = await supabase.from('vendas').select('*', { count: 'exact', head: true }).gte('data_venda', hojeTZ);

        // 5. Recebido Hoje 
        // Vendas PAGAS hoje
        const { data: vendasHojePagas } = await supabase.from('vendas').select('total').gte('data_venda', hojeTZ).eq('tipo', 'pago');
        const totalPagasHoje = vendasHojePagas?.reduce((acc, v) => acc + Number(v.total), 0) || 0;
        
        // Pagamentos de Fiados hoje
        const { data: pgtsHoje } = await supabase.from('pagamentos_fiado').select('valor').gte('data_pagamento', hojeTZ);
        const fiadosRecebidosHoje = pgtsHoje?.reduce((acc, p) => acc + Number(p.valor), 0) || 0;

        // Despesas de Hoje
        const { data: despHoje } = await supabase.from('despesas').select('valor').gte('data_despesa', hojeTZ);
        const despesasDiarias = despHoje?.reduce((acc, d) => acc + Number(d.valor), 0) || 0;

        setMetrics({
          faturamentoMes: fatMes,
          lucroReal: lucro,
          totalFiado: fiadoTot,
          vendasHoje: countVendas || 0,
          recebidoHoje: totalPagasHoje + fiadosRecebidosHoje,
          despesasHoje: despesasDiarias
        });

        // 6. Inadimplentes (Top 3)
        const { data: inads } = await supabase.from('fiados')
          .select('*, clientes(nome)')
          .lt('data_vencimento', hojeStr)
          .neq('status', 'pago')
          .order('data_vencimento', { ascending: true })
          .limit(3);
        
        if (inads) setInadimplentes(inads);

        // 7. Ultimas Vendas
        const { data: ultVendas } = await supabase.from('vendas')
          .select(`
            id,
            total,
            tipo,
            data_venda,
            clientes (
              nome
            )
          `)
          .order('data_venda', { ascending: false })
          .limit(5);
        
        if (ultVendas) setUltimasVendas(ultVendas);

      } catch (err) {
        console.error("Erro carregando config:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (loading) {
    return <div className="p-10 font-bold text-center text-gray-400">Carregando painel...</div>;
  }

  return (
    <div className="p-4 space-y-6 pb-24 relative min-h-screen">
      {installPrompt && !isInstalled && showInstallBanner && (
        <div className="bg-[#1a9e5c] text-white px-4 py-3 flex items-center justify-between mb-2 rounded-xl shadow-md border-b-4 border-[#0d7a40]">
           <div className="flex-1">
             <div className="font-bold flex items-center gap-2 text-sm">
               <img src="/pwa-192x192.png" alt="Caderneta" className="w-6 h-6 rounded-md bg-white"/>
               <span>Instale o Caderneta na tela inicial!</span>
             </div>
             <p className="text-xs text-white/90 mt-0.5 ml-8">Acesse mais rápido, funciona como app</p>
           </div>
           <div className="flex gap-2 items-center ml-2">
             <button onClick={handleInstall} className="bg-white text-[#1a9e5c] text-xs px-3 py-1.5 rounded-full font-bold shadow-sm active:scale-95 transition-transform">Instalar</button>
             <button onClick={handleDismissInstall} className="opacity-80 hover:opacity-100 p-1 bg-white/10 rounded-full"><X size={16}/></button>
           </div>
        </div>
      )}
      
      {/* Header */}

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-2 border border-gray-100">
        <div>
          <h1 className="text-xl font-syne font-bold text-gray-800">
            Olá, {profile?.nome?.split(' ')[0] || 'Vendedor'} 👋
          </h1>
          <p className="text-sm text-gray-500 font-sans font-medium">Bem-vindo ao Caderneta</p>
        </div>
        <div className="w-12 h-12 bg-[#1a9e5c] text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
          {profile?.nome?.charAt(0) || 'C'}
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-[#1a9e5c] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp size={64} />
        </div>
        <p className="text-[#dcfce7] text-sm font-medium mb-1">Faturamento do Mês</p>
        <h2 className="text-4xl font-syne font-bold mb-6">
          R$ {metrics.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h2>
      </div>

      {/* Mini Cards Quad */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center py-4 border border-gray-100 flex flex-col items-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Lucro Real</p>
          <p className="font-bold text-[#1a9e5c] text-lg">R$ {metrics.lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card text-center py-4 border border-gray-100 flex flex-col items-center bg-[#fef2f2] border-[#fecaca]/50">
          <p className="text-xs text-[#dc2626] font-medium mb-1">Despesas Hoje</p>
          <p className="font-bold text-[#dc2626] text-lg">R$ {metrics.despesasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card text-center py-4 border border-gray-100 flex flex-col items-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Vendas Hoje</p>
          <p className="font-bold text-[#1a9e5c] text-lg">{metrics.vendasHoje}</p>
        </div>
        <div className="card text-center py-4 border border-gray-100 flex flex-col items-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Recebido Hoje</p>
          <p className="font-bold text-[#b45309] text-lg">R$ {metrics.recebidoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card text-center py-4 border border-gray-100 flex flex-col items-center col-span-2 bg-[#fef3c7] border-[#fde68a]/50">
          <p className="text-xs text-[#b45309] font-medium mb-1">Total Preso no Fiado</p>
          <p className="font-bold text-[#92400e] text-lg">R$ {metrics.totalFiado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Inadimplentes */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-syne font-bold text-gray-800 text-lg">Inadimplentes</h3>
          <Link to="/fiados" className="text-sm text-[#1a9e5c] font-bold hover:underline">Ver todos</Link>
        </div>
        <div className="space-y-2">
          {inadimplentes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum fiado em atraso 👍</p>
          ) : inadimplentes.map((inad) => {
            const diasAtraso = Math.floor((new Date().getTime() - new Date(inad.data_vencimento).getTime()) / (1000 * 3600 * 24));
            
            return (
              <div key={inad.id} className="card bg-[#fef2f2] border border-[#fecaca] shadow-none flex justify-between items-center p-4 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fee2e2] text-[#dc2626] rounded-full flex items-center justify-center text-sm font-bold">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{inad.clientes?.nome || 'Avulso'}</p>
                    <p className="text-xs text-[#dc2626] font-medium">{diasAtraso} dias atrasado</p>
                  </div>
                </div>
                <span className="font-bold text-[#dc2626]">R$ {Number(inad.valor_restante).toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Últimas Vendas */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-syne font-bold text-gray-800 text-lg">Últimas Vendas</h3>
        </div>
        <div className="space-y-2">
          {ultimasVendas.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhuma venda registrada ainda.</p>
          ) : ultimasVendas.map((venda) => (
            <div key={venda.id} className="card p-4 flex justify-between items-center border border-gray-100 hover:border-[#1a9e5c]/30 transition-colors">
              <div>
                <p className="font-bold text-gray-800 text-sm">{venda.clientes?.nome || venda.cliente_nome_avulso}</p>
                <div className="mt-1">
                  {venda.tipo === 'pago' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]">PAGO</span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309]">FIADO</span>
                  )}
                  <span className="text-xs text-gray-400 font-medium ml-2">
                    {new Date(venda.data_venda).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <span className="font-bold text-gray-800">R$ {Number(venda.total).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAB - Fixed Bottom Right */}
      <button 
        onClick={() => navigate('/venda')}
        className="fixed bottom-[84px] right-6 w-14 h-14 bg-[#1a9e5c] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#1a9e5c]/40 active:scale-90 transition-transform z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
