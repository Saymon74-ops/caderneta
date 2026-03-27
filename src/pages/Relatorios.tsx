import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Relatorios() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [filtro, setFiltro] = useState<'hoje' | '7d' | '15d' | '30d' | 'tudo'>('hoje');
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    faturamento: 0,
    lucroReal: 0,
    pagas: 0,
    fiado: 0,
    despesas: 0,
    lucroLiquido: 0,
    inadimplenciaAtual: 0
  });

  const [topClientes, setTopClientes] = useState<any[]>([]);
  const [comissoes, setComissoes] = useState<any[]>([]);

  useEffect(() => {
    async function loadRelatorios() {
      if (!user) return;
      setLoading(true);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      let dataInicio = new Date(hoje);
      if (filtro === '7d') dataInicio.setDate(hoje.getDate() - 7);
      else if (filtro === '15d') dataInicio.setDate(hoje.getDate() - 15);
      else if (filtro === '30d') dataInicio.setDate(hoje.getDate() - 30);
      else if (filtro === 'tudo') dataInicio = new Date(0); // 1970
      
      const inicioTZ = new Date(dataInicio.getTime() - (dataInicio.getTimezoneOffset() * 60000)).toISOString();

      try {
        // 1. Vendas no periodo
        const { data: vendas } = await supabase
          .from('vendas')
          .select(`
            id,
            total,
            tipo,
            data_venda,
            vendedor_id,
            cliente_nome_avulso,
            clientes (
              nome
            )
          `)
          .gte('data_venda', inicioTZ);

        const vds = vendas || [];
        const faturamento = vds.reduce((acc, v) => acc + Number(v.total), 0);
        const pagas = vds.filter(v => v.tipo === 'pago').reduce((acc, v) => acc + Number(v.total), 0);
        const fiado = vds.filter(v => v.tipo === 'fiado').reduce((acc, v) => acc + Number(v.total), 0);
        
        // 2. Lucro Real e Itens
        let lucroReal = 0;
        if (vds.length > 0) {
          const ids = vds.map(v => v.id);
          const { data: itens } = await supabase.from('itens_venda').select('*').in('venda_id', ids);
          lucroReal = (itens || []).reduce((acc, i) => acc + ((Number(i.preco_unitario) - Number(i.custo_unitario)) * Number(i.quantidade)), 0);
        }

        // 3. Despesas no periodo
        const { data: despesas } = await supabase.from('despesas').select('valor').gte('data_despesa', inicioTZ);
        const totalDespesas = (despesas || []).reduce((acc, d) => acc + Number(d.valor), 0);

        // 4. Inadimplencia Atual (Nao depende do filtro de periodo para mostrar o passivo real da empresa)
        const hojeTZ = new Date(hoje.getTime() - (hoje.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const { data: fiados } = await supabase.from('fiados').select('valor_restante').lt('data_vencimento', hojeTZ).neq('status', 'pago');
        const inadimplenciaAtual = (fiados || []).reduce((acc, f) => acc + Number(f.valor_restante), 0);

        const lucroLiquido = lucroReal - totalDespesas;

        setMetrics({ faturamento, lucroReal, pagas, fiado, despesas: totalDespesas, lucroLiquido, inadimplenciaAtual });

        // Agrupamento Top Clientes
        const clientesMap: Record<string, { nome: string, total: number }> = {};
        vds.forEach(v => {
          const nome = (v.clientes as any)?.nome || v.cliente_nome_avulso || 'Avulso';
          if (!clientesMap[nome]) clientesMap[nome] = { nome, total: 0 };
          clientesMap[nome].total += Number(v.total);
        });
        const top5 = Object.values(clientesMap).sort((a, b) => b.total - a.total).slice(0, 5);
        setTopClientes(top5);

        // Comissões
        const { data: vendedoresList } = await supabase.from('vendedores').select('*');
        const vendsDb = vendedoresList || [];
        
        const comissoesMap: Record<string, { nome: string, vendasTotal: number, comissaoEstimada: number }> = {};
        
        vds.forEach(v => {
          if (v.vendedor_id) {
            const vendInfo = vendsDb.find(x => x.id === v.vendedor_id);
            if (vendInfo) {
              const taxa = vendInfo.comissao || 0; // se houver a coluna
              if (!comissoesMap[vendInfo.id]) {
                comissoesMap[vendInfo.id] = { nome: vendInfo.nome, vendasTotal: 0, comissaoEstimada: 0 };
              }
              comissoesMap[vendInfo.id].vendasTotal += Number(v.total);
              comissoesMap[vendInfo.id].comissaoEstimada += Number(v.total) * (Number(taxa) / 100);
            }
          }
        });
        
        setComissoes(Object.values(comissoesMap).sort((a,b) => b.comissaoEstimada - a.comissaoEstimada));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadRelatorios();
  }, [user, filtro]);

  const fltBtns = [
    { id: 'hoje', label: 'Hoje' },
    { id: '7d', label: '7 Dias' },
    { id: '15d', label: '15 Dias' },
    { id: '30d', label: '30 Dias' },
    { id: 'tudo', label: 'Tudo' },
  ];

  return (
    <div className="p-4 min-h-screen bg-[#f2f6f3] pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/menu')} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-syne font-bold text-gray-800">Relatórios</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
        {fltBtns.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFiltro(btn.id as any)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${filtro === btn.id ? 'bg-[#1a9e5c] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center p-10 font-bold text-gray-400">Calculando relatórios...</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#1a9e5c] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <PieIcon className="absolute -right-4 -bottom-4 opacity-10" size={120} />
            <p className="text-[#dcfce7] text-sm font-medium mb-1">Faturamento Bruto</p>
            <h2 className="text-4xl font-syne font-bold mb-4 relative z-10">
              R$ {metrics.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center py-4 border border-gray-100 flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Lucro Real</p>
              <p className="font-syne font-bold text-[#1a9e5c] text-xl">R$ {metrics.lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="card text-center py-4 border border-gray-100 flex flex-col items-center bg-[#fef2f2] border-[#fecaca]/40">
              <p className="text-[10px] uppercase tracking-wider text-[#dc2626] font-bold mb-1">Despesas</p>
              <p className="font-syne font-bold text-[#dc2626] text-xl">R$ {metrics.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            
            <div className="card text-center py-5 border border-gray-100 flex flex-col items-center col-span-2 bg-[#f8fafc]">
              <p className="text-xs text-slate-500 font-bold mb-1">💸 Lucro Líquido</p>
              <p className={`font-syne font-bold text-3xl ${metrics.lucroLiquido < 0 ? 'text-[#dc2626]' : 'text-slate-800'}`}>
                R$ {metrics.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Comparativo Pagas vs Fiado */}
          <div className="card p-5">
            <h3 className="font-syne font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-gray-400" /> Comparativo de Entradas
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                  <span>Vendas Pagas</span>
                  <span className="text-[#1a9e5c]">R$ {metrics.pagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#1a9e5c] h-2 rounded-full" style={{ width: `${metrics.faturamento ? (metrics.pagas / metrics.faturamento) * 100 : 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                  <span>Vendas no Fiado</span>
                  <span className="text-[#b45309]">R$ {metrics.fiado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#b45309] h-2 rounded-full" style={{ width: `${metrics.faturamento ? (metrics.fiado / metrics.faturamento) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Inadimplencia Atual Global */}
          <div className="card p-4 border border-[#fecaca] bg-[#fef2f2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fee2e2] text-[#dc2626] rounded-xl flex items-center justify-center">
                <AlertOctagon size={20} />
              </div>
              <div>
                <p className="font-bold text-[#b91c1c] text-sm">Passivo / Inadimplência</p>
                <p className="text-[10px] text-[#dc2626] font-medium leading-none">Vencidos e não pagos (Sempre)</p>
              </div>
            </div>
            <span className="font-syne font-bold text-xl text-[#dc2626]">
              R$ {metrics.inadimplenciaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Top 5 Clientes */}
          <div className="card p-5">
            <h3 className="font-syne font-bold text-gray-800 mb-4 flex items-center gap-2">
               Top 5 Clientes <TrendingUp size={16} className="text-[#1a9e5c]" />
            </h3>
            {topClientes.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum dado no período.</p>
            ) : (
              <div className="space-y-3">
                {topClientes.map((c, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[#1a9e5c] font-bold text-sm w-4">{i + 1}º</span>
                      <span className="font-bold text-gray-700 text-sm">{c.nome}</span>
                    </div>
                    <span className="font-bold text-gray-800 text-sm">R$ {c.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comissoes por Vendedor */}
          <div className="card p-5">
            <h3 className="font-syne font-bold text-gray-800 mb-4">Comissões (Vendedores)</h3>
            {comissoes.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma venda comissionada no período.</p>
            ) : (
              <div className="space-y-3">
                {comissoes.map((c, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{c.nome}</p>
                      <p className="text-xs text-gray-500 font-medium">Vendas: R$ {c.vendasTotal.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Comissão (Est.)</p>
                      <p className="font-syne font-bold text-[#1a9e5c] text-lg">R$ {c.comissaoEstimada.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
