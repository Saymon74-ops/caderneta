import { useState, useEffect } from 'react';
import { HandCoins, ChevronDown, ChevronUp, Check, X, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Fiados() {
  const { user } = useAuth();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [fiadoSelecionado, setFiadoSelecionado] = useState<any>(null);
  
  const [valorPgto, setValorPgto] = useState<string>('');
  const [obsPgto, setObsPgto] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState(false);

  const [fiados, setFiados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFiados = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('fiados')
      .select(`
        *,
        clientes ( nome, telefone ),
        pagamentos_fiado ( id, valor, observacao, data_pagamento )
      `)
      .neq('status', 'pago')
      .order('data_vencimento', { ascending: true });
      
    if (data) setFiados(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiados();
  }, [user]);

  const openPagamento = (fiado: any) => {
    setFiadoSelecionado(fiado);
    setValorPgto(fiado.valor_restante.toString());
    setObsPgto('');
    setModalOpen(true);
  };

  const handlePagamento = async () => {
    if (!fiadoSelecionado || !user) return;
    
    const valorNum = parseFloat(valorPgto);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error('Insira um valor maior que zero.');
      return;
    }
    
    if (valorNum > fiadoSelecionado.valor_restante) {
      toast.error('O valor não pode ser maior que o restante!');
      return;
    }

    setLoadingAction(true);
    try {
      // 1. Inserir em pagamentos_fiado
      const { error: ePgto } = await supabase.from('pagamentos_fiado').insert({
        dono_id: user.id,
        fiado_id: fiadoSelecionado.id,
        valor: valorNum,
        observacao: obsPgto
      });
      if (ePgto) throw ePgto;

      // 2. Calcular novos valores
      const novoPago = Number(fiadoSelecionado.valor_pago) + valorNum;
      const novoRestante = Number(fiadoSelecionado.valor_total) - novoPago;
      const novoStatus = novoRestante <= 0.01 ? 'pago' : 'parcial';

      // 3. Atualizar fiados
      const { error: eFiado } = await supabase.from('fiados').update({
        valor_pago: novoPago,
        valor_restante: novoRestante,
        status: novoStatus
      }).eq('id', fiadoSelecionado.id);
      
      if (eFiado) throw eFiado;

      toast.success(novoStatus === 'pago' ? 'Fiado quitado com sucesso!' : 'Pagamento parcial registrado!');
      setModalOpen(false);
      fetchFiados();
    } catch (err: any) {
      console.error('Erro fiado:', err.message);
      toast.error('Erro: ' + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const calcularStatus = (dataVencimento: string) => {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const venc = new Date(dataVencimento);
    // Compensa fuso do brasil
    venc.setTime(venc.getTime() + Math.abs(venc.getTimezoneOffset() * 60000));
    venc.setHours(0,0,0,0);
    
    const diffTime = venc.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { key: 'atrasado', label: `ATRASADO (${Math.abs(diffDays)} dias)`, color: 'bg-[#fee2e2] text-[#dc2626] border-[#fecaca]', dias: Math.abs(diffDays) };
    if (diffDays === 0) return { key: 'hoje', label: 'VENCE HOJE', color: 'bg-[#ffedd5] text-[#ea580c] border-[#fed7aa]', dias: 0 };
    return { key: 'futuro', label: `VENCE EM ${diffDays} DIAS`, color: 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]', dias: diffDays };
  };

  const handleCobranca = (fiado: any) => {
    const cliente = fiado.clientes;
    if (!cliente || !cliente.telefone) {
      toast.error('Cadastre o telefone deste cliente para enviar cobrança.');
      return;
    }
    
    // Deixa apenas os numeros
    const foneLimpo = cliente.telefone.replace(/\D/g, '');
    const valorFormatado = Number(fiado.valor_restante).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const statusInfo = calcularStatus(fiado.data_vencimento);
    
    let msg = '';
    
    if (statusInfo.key === 'atrasado') {
       msg = `Olá, ${cliente.nome}! 😊 Tudo bem? Passando para avisar que seu fiado de *R$ ${valorFormatado}* está em atraso há *${statusInfo.dias} dias*. Quando puder me pagar, é só me chamar! Obrigado 🙏`;
    } else if (statusInfo.key === 'hoje') {
       msg = `Olá, ${cliente.nome}! 😊 Seu fiado de *R$ ${valorFormatado}* vence *hoje*. Quando puder, me avisa! Obrigado 🙏`;
    } else {
       // Corrige fuso novamente pra não mostrar dia anterior na msg
       const dt = new Date(fiado.data_vencimento);
       dt.setTime(dt.getTime() + Math.abs(dt.getTimezoneOffset() * 60000));
       const dataFormatada = dt.toLocaleDateString('pt-BR');
       
       msg = `Olá, ${cliente.nome}! 😊 Passando para lembrar que você tem um fiado de *R$ ${valorFormatado}* comigo com vencimento em *${dataFormatada}*. Qualquer dúvida é só me chamar! 🙏`;
    }
    
    window.open(`https://wa.me/55${foneLimpo}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Carregando fiados...</div>;

  return (
    <div className="p-4 space-y-4 pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-syne font-bold text-gray-800">Fiados em Aberto</h1>
      </div>

      {fiados.length === 0 && (
        <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm mt-10">
          <p className="text-gray-500 font-medium">Você não possui nenhum fiado em aberto. Ótimo trabalho!</p>
        </div>
      )}

      <div className="space-y-4">
        {fiados.map(fiado => {
          const progress = (fiado.valor_pago / fiado.valor_total) * 100;
          const statusInfo = calcularStatus(fiado.data_vencimento);
          const historico = fiado.pagamentos_fiado || [];
          const isExpanded = expandedId === fiado.id;

          return (
            <div key={fiado.id} className="card p-5 border border-gray-100 relative overflow-hidden transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{fiado.clientes?.nome || 'Avulso'}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-syne font-bold text-[#dc2626]">R$ {Number(fiado.valor_restante).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 font-medium">Total: R$ {Number(fiado.valor_total).toFixed(2)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-bold">
                  <span>Pago: R$ {Number(fiado.valor_pago).toFixed(2)}</span>
                  <span className="text-[#1a9e5c]">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#1a9e5c] h-2 rounded-full shadow-sm transition-all" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => openPagamento(fiado)}
                  className="flex-1 bg-[#1a9e5c] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#1a9e5c]/20 text-xs sm:text-sm"
                >
                  <HandCoins size={16} />
                  Pagar
                </button>
                <button 
                  onClick={() => handleCobranca(fiado)}
                  className="flex-1 bg-[#25D366] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#25D366]/20 text-xs sm:text-sm"
                >
                  <MessageCircle size={16} />
                  Cobrar
                </button>
                <button 
                  onClick={() => setExpandedId(isExpanded ? null : fiado.id)}
                  className={`p-2.5 rounded-xl border transition-colors ${isExpanded ? 'bg-gray-200 text-gray-700 border-gray-300' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
                >
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {/* Histórico Expansível */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Histórico de Pagamentos</h4>
                  {historico.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum pagamento registrado.</p>
                  ) : (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {historico.map((pgto: any) => (
                        <div key={pgto.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-bold text-gray-700">R$ {Number(pgto.valor).toFixed(2)}</p>
                            {pgto.observacao && <p className="text-xs text-gray-500">{pgto.observacao}</p>}
                          </div>
                          <p className="text-xs font-medium text-gray-400">
                            {new Date(pgto.data_pagamento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-syne font-bold text-gray-800">Baixar Fiado</h2>
              <button onClick={() => setModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex justify-between items-center bg-[#f2f6f3] p-4 rounded-xl mb-6">
              <span className="font-medium text-gray-600 text-sm">Restante: {fiadoSelecionado?.clientes?.nome || 'Avulso'}</span>
              <span className="font-syne font-bold text-xl text-[#dc2626]">R$ {Number(fiadoSelecionado?.valor_restante).toFixed(2)}</span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Valor do Pagamento</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-field pl-10 text-lg font-bold" 
                    value={valorPgto}
                    onChange={(e) => setValorPgto(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Observação (Opcional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Pagou em dinheiro, pix..." 
                  value={obsPgto}
                  onChange={(e) => setObsPgto(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handlePagamento}
                disabled={loadingAction}
                className="flex-1 bg-[#1a9e5c] text-white rounded-xl py-3 font-semibold text-sm active:scale-95 transition-transform"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
