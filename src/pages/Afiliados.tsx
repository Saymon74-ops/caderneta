import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Copy, Users, DollarSign, TrendingUp, CheckCircle2, History, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Afiliados() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [afiliado, setAfiliado] = useState<any>(null);
  const [indicacoes, setIndicacoes] = useState<any[]>([]);
  const [saques, setSaques] = useState<any[]>([]);
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);
  
  const [nome, setNome] = useState('');
  const [pix, setPix] = useState('');
  const [cadastrando, setCadastrando] = useState(false);

  useEffect(() => {
    if (user) {
      carregarAfiliado();
    }
  }, [user]);

  async function carregarAfiliado() {
    try {
      setLoading(true);
      const { data: af } = await supabase
        .from('afiliados')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (af) {
        setAfiliado(af);
        
        const { data: ind } = await supabase
          .from('indicacoes')
          .select('*, profiles:cliente_user_id(nome, email)')
          .eq('afiliado_id', af.id)
          .order('criado_em', { ascending: false });
          
        if (ind) {
          setIndicacoes(ind);
        }

        const { data: sq } = await supabase
          .from('saques')
          .select('*')
          .eq('afiliado_id', af.id)
          .order('criado_em', { ascending: false });
        if (sq) setSaques(sq);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function cadastrarAfiliado(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !pix.trim()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    setCadastrando(true);
    const firstName = nome.split(' ')[0].toUpperCase().substring(0, 4);
    const randomNumber = Math.floor(100 + Math.random() * 900);
    const generatedCode = `${firstName}${randomNumber}`;

    try {
      const { data, error } = await supabase
        .from('afiliados')
        .insert({
          user_id: user?.id,
          nome,
          pix,
          codigo: generatedCode
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setAfiliado(data);
      toast.success('Cadastro realizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao cadastrar. Tente novamente.');
      console.error(error);
    } finally {
      setCadastrando(false);
    }
  }

  function copiarLink() {
    if (!afiliado) return;
    const url = `${window.location.origin}/?ref=${afiliado.codigo}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  }

  async function solicitarSaque() {
    if (!afiliado) return;
    const valorJaSolicitado = saques.filter(s => s.status !== 'recusado').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const valorDisponivel = afiliado.total_ganho - valorJaSolicitado;
    
    if (valorDisponivel <= 0) {
      toast.error('Saldo insuficiente ou já solicitado.');
      return;
    }

    try {
      setSolicitandoSaque(true);
      const { data, error } = await supabase.from('saques').insert({
        afiliado_id: afiliado.id,
        valor: valorDisponivel,
        pix: afiliado.pix,
        status: 'pendente'
      }).select().single();
      
      if (error) throw error;
      setSaques([data, ...saques]);
      toast.success('Saque solicitado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao solicitar saque.');
    } finally {
      setSolicitandoSaque(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f6f3] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1a9e5c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ativos = indicacoes.filter(i => i.status === 'ativo').length;


  return (
    <div className="p-4 min-h-screen bg-[#f2f6f3] pb-24">
      <h1 className="text-2xl font-syne font-bold text-gray-800 mb-6">Afiliados</h1>

      {!afiliado ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div className="w-16 h-16 bg-[#1a9e5c]/10 text-[#1a9e5c] rounded-2xl flex items-center justify-center mb-4">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-syne font-bold text-gray-800 mb-2">Seja um Afiliado</h2>
          <p className="text-gray-500 text-sm mb-6">Indique o Caderneta e ganhe 50% de comissão recorrente por cada cliente ativo.</p>
          
          <form onSubmit={cadastrarAfiliado} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#1a9e5c] outline-none transition-colors"
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Chave PIX</label>
              <input
                type="text"
                value={pix}
                onChange={(e) => setPix(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#1a9e5c] outline-none transition-colors"
                placeholder="CPF, Email, Telefone..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={cadastrando}
              className="w-full bg-[#1a9e5c] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70"
            >
              {cadastrando ? 'Cadastrando...' : 'Criar meu link'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Seção 1: Meu link */}
          <div className="bg-[#1a9e5c] p-6 rounded-3xl text-white mb-6 shadow-lg shadow-[#1a9e5c]/30">
            <h2 className="text-xl font-syne font-bold mb-2">Meu Link de Indicação</h2>
            <p className="opacity-80 text-sm mb-4">Compartilhe este link e ganhe comissão por cada cadastro.</p>
            
            <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm border border-white/20">
              <span className="font-mono text-sm truncate mr-2">
                {window.location.origin.replace(/^https?:\/\//, '')}/?ref={afiliado.codigo}
              </span>
              <button 
                onClick={copiarLink}
                className="bg-white text-[#1a9e5c] p-3 rounded-xl flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          {/* Seção 2: Meus números */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">Indicados Ativos</p>
              <p className="text-2xl font-syne font-bold text-gray-800">{ativos}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <DollarSign size={20} />
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">Ganho Total</p>
              <p className="text-2xl font-syne font-bold text-gray-800">
                R$ {afiliado.total_ganho?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
              </p>
            </div>
            <div className="col-span-2 bg-gradient-to-r from-[#fef3c7] to-[#fde68a] p-5 rounded-3xl border border-[#fcd34d] flex items-center justify-between">
              <div>
                <p className="text-[#b45309] text-xs font-bold uppercase mb-1">Previsão Mês Atual</p>
                <p className="text-xl font-syne font-bold text-gray-900">
                  {ativos} ativos × 50%
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center text-[#b45309]">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Seção 4: Saque */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
            <h3 className="font-syne font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-[#1a9e5c]" /> Solicitar Saque
            </h3>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl mb-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold mb-1">Chave Pix Cadastrada</p>
                <p className="text-gray-800 font-medium truncate">{afiliado.pix}</p>
              </div>
            </div>
            <button 
              onClick={solicitarSaque}
              disabled={solicitandoSaque}
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70"
            >
              <Send size={18} /> {solicitandoSaque ? 'Solicitando...' : 'Solicitar Saque'}
            </button>
          </div>

          {/* Seção 5: Histórico de Saques */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
            <h3 className="font-syne font-bold text-gray-800 mb-4 flex items-center gap-2">
              <History size={20} className="text-[#b45309]" /> Histórico de Saques
            </h3>
            
            {saques.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm">Nenhum saque solicitado ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {saques.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-gray-800">R$ {Number(s.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">{new Date(s.criado_em).toLocaleDateString('pt-BR')}</p>
                    </div>
                    {s.status === 'pago' ? (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">Pago</span>
                    ) : s.status === 'recusado' ? (
                      <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-lg">Recusado</span>
                    ) : (
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-lg">Pendente</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção 3: Histórico */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-syne font-bold text-gray-800 mb-4 flex items-center gap-2">
              <History size={20} className="text-[#1a9e5c]" /> Histórico de Indicações
            </h3>
            
            {indicacoes.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma indicação ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {indicacoes.map((ind) => (
                  <div key={ind.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800">{ind.profiles?.nome || 'Usuário Sem Nome'}</p>
                        <p className="text-xs text-gray-500">{new Date(ind.criado_em).toLocaleDateString('pt-BR')}</p>
                      </div>
                      {ind.status === 'ativo' ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 size={12} /> Ativo
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-lg">
                          Cancelado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
