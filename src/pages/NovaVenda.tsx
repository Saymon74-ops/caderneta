import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function NovaVenda() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState<'pago' | 'fiado'>('pago');
  const [loading, setLoading] = useState(false);
  
  const [clientesDb, setClientesDb] = useState<any[]>([]);
  const [produtosDb, setProdutosDb] = useState<any[]>([]);
  const [vendedoresDb, setVendedoresDb] = useState<any[]>([]);

  const [clienteOption, setClienteOption] = useState('');
  const [clienteAvulso, setClienteAvulso] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [vencimento, setVencimento] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [modoVencimento, setModoVencimento] = useState<'manual' | 'quinzenal'>('manual');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      const resClientes = await supabase.from('clientes').select('*').eq('ativo', true).order('nome');
      if (resClientes.data) setClientesDb(resClientes.data);

      const resProds = await supabase.from('produtos').select('*').order('nome');
      if (resProds.data) setProdutosDb(resProds.data);

      const resVend = await supabase.from('vendedores').select('*').order('nome');
      if (resVend.data) setVendedoresDb(resVend.data);
    }
    loadData();
  }, [user]);

  const handleProd = (prod: any, add: boolean) => {
    const ex = carrinho.find(i => i.id === prod.id);
    if (add) {
      if (ex) setCarrinho(carrinho.map(i => i.id === prod.id ? { ...i, qtd: i.qtd + 1 } : i));
      else setCarrinho([...carrinho, { ...prod, qtd: 1 }]);
    } else {
      if (ex && ex.qtd > 1) setCarrinho(carrinho.map(i => i.id === prod.id ? { ...i, qtd: i.qtd - 1 } : i));
      else setCarrinho(carrinho.filter(i => i.id !== prod.id));
    }
  };

  const total = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  const finalizarVenda = async () => {
    setLoading(true);

    try {
      if (tipo === 'fiado' && clienteOption === 'avulso') {
        toast.error('Fiado só é permitido para clientes cadastrados.');
        setLoading(false);
        return;
      }

      const clienteFinal = clienteOption === 'avulso' ? null : clienteOption;
      const avulsoFinal = clienteOption === 'avulso' ? clienteAvulso : null;

      // Insert Venda
      const { data: novaVenda, error: eVenda } = await supabase.from('vendas').insert({
        dono_id: user?.id,
        cliente_id: clienteFinal,
        cliente_nome_avulso: avulsoFinal,
        vendedor_id: vendedorId || null,
        total: total,
        tipo: tipo
      }).select().single();

      if (eVenda || !novaVenda) throw eVenda;

      // Insert Items & Deduct Stock
      const itensParams = carrinho.map(i => ({
        venda_id: novaVenda.id,
        produto_id: i.id,
        quantidade: i.qtd,
        preco_unitario: i.preco,
        custo_unitario: i.custo || 0
      }));
      
      const { error: eItens } = await supabase.from('itens_venda').insert(itensParams);
      if (eItens) throw eItens;

      // Deduct stock manually
      for (const item of carrinho) {
        const prodMatch = produtosDb.find(p => p.id === item.id);
        if (prodMatch) {
          const novoEstoque = (prodMatch.estoque_atual || prodMatch.estoque || 0) - item.qtd;
          await supabase.from('produtos').update({ estoque_atual: novoEstoque }).eq('id', item.id);
          
          if (novoEstoque < 0) {
            toast.error(`Atenção: O estoque do produto ${item.nome} ficou negativo (${novoEstoque}).`);
          }
        }
      }

      // Handle Fiado with installments
      if (tipo === 'fiado' && clienteFinal) {
        const valorParcela = Number((total / parcelas).toFixed(2));
        
        let currentDate = new Date(vencimento);
        // Corrige timezone pra evitar dia a menos
        currentDate = new Date(currentDate.getTime() + Math.abs(currentDate.getTimezoneOffset() * 60000));

        const fiadosArr = [];
        
        for (let i = 0; i < parcelas; i++) {
          let dataParcela: Date;
          if (modoVencimento === 'quinzenal') {
            dataParcela = new Date(currentDate.getTime() + (i * 15 * 24 * 60 * 60 * 1000));
          } else {
            dataParcela = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, currentDate.getDate());
          }
          
          fiadosArr.push({
            dono_id: user?.id,
            cliente_id: clienteFinal,
            valor_total: valorParcela,
            valor_pago: 0,
            valor_restante: valorParcela,
            status: 'aberto',
            data_vencimento: dataParcela.toISOString().split('T')[0]
          });
        }
        
        const { error: eFiados } = await supabase.from('fiados').insert(fiadosArr);
        if (eFiados) throw eFiados;
      }

      toast.success('Venda registrada com sucesso!');
      
      // Redirect
      if (tipo === 'fiado') {
        navigate('/fiados');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao registrar venda: ' + err.message);
    }
    
    setLoading(false);
  };

  const getClienteNome = () => {
    if (clienteOption === 'avulso') return clienteAvulso || 'Avulso s/ nome';
    const c = clientesDb.find(x => x.id === clienteOption);
    return c ? c.nome : '—';
  };

  const cantProceedStep1 = carrinho.length === 0 || !clienteOption || (clienteOption === 'avulso' && !clienteAvulso.trim());
  const cantProceedStep2 = loading || (tipo === 'fiado' && (!vencimento || parcelas < 1));

  return (
    <div className="p-4 space-y-6 pb-36 h-full flex flex-col min-h-screen">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-syne font-bold text-gray-800">Vender</h1>
        <div className="bg-[#1a9e5c] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 flex-1 animate-in fade-in">
          <div className="card border-0 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cliente</label>
              <select 
                className="input-field bg-gray-50 border-gray-200"
                value={clienteOption}
                onChange={(e) => setClienteOption(e.target.value)}
              >
                <option value="">Selecione um cliente...</option>
                <option value="avulso">👤 Cliente Avulso (Não cadastrado)</option>
                {clientesDb.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {clienteOption === 'avulso' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Cliente Avulso</label>
                <input 
                  type="text" 
                  className="input-field bg-gray-50 border-gray-200" 
                  placeholder="Nome rápido para registro..."
                  value={clienteAvulso}
                  onChange={e => setClienteAvulso(e.target.value)} 
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Vendedor (Opcional)</label>
              <select 
                className="input-field bg-gray-50 border-gray-200"
                value={vendedorId}
                onChange={(e) => setVendedorId(e.target.value)}
              >
                <option value="">Selecione quem está vendendo...</option>
                {vendedoresDb.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="card shadow-sm p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#1a9e5c]" />
              <h3 className="font-bold text-gray-800">Produtos</h3>
            </div>
            
            {produtosDb.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">Nenhum produto cadastrado</div>
            ) : (
              <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {produtosDb.map(prod => {
                  const noCarrinho = carrinho.find(i => i.id === prod.id)?.qtd || 0;
                  const preco = Number(prod.preco_venda || 0);
                  
                  return (
                    <div key={prod.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-[#1a9e5c]/20 transition-colors">
                      <div>
                        <p className="font-bold text-gray-800 text-sm mb-1">{prod.nome}</p>
                        <p className="font-syne font-bold text-[#1a9e5c]">R$ {preco.toFixed(2)}</p>
                      </div>
                      
                      {noCarrinho > 0 ? (
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
                          <button onClick={() => handleProd(prod, false)} className="w-8 h-8 flex items-center justify-center bg-white text-gray-600 rounded-lg shadow-sm border border-gray-100 active:bg-gray-100">
                            <Minus size={16} />
                          </button>
                          <span className="font-bold text-base w-4 text-center">{noCarrinho}</span>
                          <button onClick={() => handleProd(prod, true)} className="w-8 h-8 flex items-center justify-center bg-[#1a9e5c] text-white rounded-lg shadow-sm active:bg-[#166534]">
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleProd({ ...prod, preco }, true)}
                          className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center active:bg-gray-200 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4">
          <div className="card">
            <h3 className="font-syne font-bold text-gray-800 mb-4 text-lg">Forma de Pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTipo('pago')}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${tipo === 'pago' ? 'border-[#1a9e5c] bg-[#dcfce7]/50 text-[#166534] shadow-md shadow-[#1a9e5c]/10' : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${tipo === 'pago' ? 'bg-[#1a9e5c] text-white shadow-sm' : 'bg-gray-100'}`}>
                  💰
                </div>
                <span className="font-bold text-center">Pago Agora</span>
              </button>
              
              <button 
                onClick={() => setTipo('fiado')}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${tipo === 'fiado' ? 'border-[#b45309] bg-[#fef3c7]/50 text-[#92400e] shadow-md shadow-[#b45309]/10' : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${tipo === 'fiado' ? 'bg-[#b45309] text-white shadow-sm' : 'bg-gray-100'}`}>
                  📒
                </div>
                <span className="font-bold text-center">Deixar Fiado</span>
              </button>
            </div>
          </div>

          {tipo === 'fiado' && (
            <div className="card border-2 border-[#fcd34d] bg-[#fffbeb] shadow-none space-y-4 animate-in fade-in">
              <div>
                <label className="block text-sm font-bold text-[#b45309] mb-2 flex items-center gap-2">
                  <Calendar size={18} /> Vencimento 1ª Parcela
                </label>

                <div className="flex gap-2 mb-3">
                  <button 
                    onClick={() => setModoVencimento('manual')}
                    className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${modoVencimento === 'manual' ? 'border-[#b45309] bg-[#b45309] text-white shadow-sm' : 'border-[#fcd34d] text-[#b45309] bg-white hover:bg-[#fef3c7]'}`}
                  >
                    📅 Escolher data
                  </button>
                  <button 
                    onClick={() => {
                      setModoVencimento('quinzenal');
                      const hoje = new Date();
                      hoje.setDate(hoje.getDate() + 15);
                      setVencimento(hoje.toISOString().split('T')[0]);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${modoVencimento === 'quinzenal' ? 'border-[#b45309] bg-[#b45309] text-white shadow-sm' : 'border-[#fcd34d] text-[#b45309] bg-white hover:bg-[#fef3c7]'}`}
                  >
                    ⚡ Quinzenal (15 dias)
                  </button>
                </div>

                {modoVencimento === 'manual' ? (
                  <input 
                    type="date" 
                    className="input-field border-[#b45309]/30 focus:ring-[#b45309] focus:border-[#b45309] bg-white font-medium text-gray-700" 
                    value={vencimento}
                    max="2099-12-31"
                    onChange={(e) => {
                      if (e.target.value.length > 10) return;
                      setVencimento(e.target.value);
                    }}
                  />
                ) : (
                  <div className="input-field border-[#b45309]/30 bg-white/50 font-medium text-gray-700 flex items-center text-sm cursor-not-allowed">
                    {vencimento ? `Vence em ${vencimento.split('-').reverse().join('/')}` : 'Calculando...'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#b45309] mb-2 flex items-center gap-2">
                  Parcelar em
                </label>
                <select 
                  className="input-field border-[#b45309]/30 focus:ring-[#b45309] focus:border-[#b45309] bg-white font-medium text-gray-700"
                  value={parcelas}
                  onChange={(e) => setParcelas(Number(e.target.value))}
                >
                  <option value={1}>1x (Valor Inteiro)</option>
                  {[2,3,4,5,6,10,12].map(num => (
                    <option key={num} value={num}>{num}x parcelamento sucessivo</option>
                  ))}
                </select>
                {parcelas > 1 && (
                  <p className="text-xs text-[#b45309] font-medium mt-2">
                    Gerará {parcelas} fiados consecutivos de R$ {(total / parcelas).toFixed(2)} separados por {modoVencimento === 'quinzenal' ? '15 dias' : '1 mês'} cada.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="card bg-gray-50 border border-gray-200 border-dashed">
            <h4 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-3">Resumo da Venda</h4>
            <div className="space-y-2 text-sm text-gray-600 mb-4 font-medium">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Cliente:</span>
                <span className="font-bold text-gray-800">{getClienteNome()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Total de Itens:</span>
                <span className="font-bold text-gray-800">{carrinho.reduce((acc, i) => acc + i.qtd, 0)} UN</span>
              </div>
            </div>
            <div className="flex justify-between items-center font-syne font-bold text-xl text-gray-800 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <span>Total a pagar:</span>
              <span className="text-[#1a9e5c]">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 justify-center pt-2">
             <button onClick={() => setStep(1)} className="font-bold text-[#1a9e5c] text-sm hover:underline">← Voltar para seleção</button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-[90px] left-0 right-0 max-w-[430px] mx-auto px-4 py-4 z-40 bg-white shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.15)] sm:bg-transparent sm:shadow-none border-t border-gray-100 sm:border-0 rounded-t-3xl sm:rounded-none">
        {step === 1 ? (
          <button 
            disabled={cantProceedStep1}
            onClick={() => setStep(2)}
            className="btn-primary py-4 w-full text-lg shadow-xl shadow-[#1a9e5c]/30 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none bg-[#1a9e5c]"
          >
            Continuar
          </button>
        ) : (
          <button 
            disabled={cantProceedStep2}
            onClick={finalizarVenda}
            className="btn-primary py-4 w-full text-lg shadow-xl shadow-[#1a9e5c]/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none bg-[#1a9e5c]"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><CheckCircle2 size={24} /> Confirmar</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
