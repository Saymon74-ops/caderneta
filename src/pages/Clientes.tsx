import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, Plus, User as UserIcon, X, Phone, MapPin, ShoppingBag, FileText, Edit, Map } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Clientes() {
  const { user } = useAuth();
  
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Cadastro/Edição
  const [showForm, setShowForm] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Campos do Form
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [enderecoRua, setEnderecoRua] = useState('');
  const [enderecoNumero, setEnderecoNumero] = useState('');
  const [enderecoBairro, setEnderecoBairro] = useState('');
  const [enderecoCidade, setEnderecoCidade] = useState('');
  const [enderecoZonaRural, setEnderecoZonaRural] = useState(false);
  const [nis, setNis] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Modal Perfil Cliente
  const [perfilAtivo, setPerfilAtivo] = useState<any>(null);
  const [perfilLoading, setPerfilLoading] = useState(false);
  const [historicoVendas, setHistoricoVendas] = useState<any[]>([]);
  const [fiadosAbertos, setFiadosAbertos] = useState<any[]>([]);
  const [totalGasto, setTotalGasto] = useState(0);

  const fetchClientes = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('ativo', true)
      .order('nome');
      
    if (data) setClientes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, [user]);

  const openForm = (cliente?: any) => {
    if (cliente) {
      setEditId(cliente.id);
      setNome(cliente.nome || '');
      setCpf(cliente.cpf || '');
      setDataNascimento(cliente.data_nascimento || '');
      setTelefone(cliente.telefone || '');
      setEnderecoRua(cliente.endereco_rua || '');
      setEnderecoNumero(cliente.endereco_numero || '');
      setEnderecoBairro(cliente.endereco_bairro || '');
      setEnderecoCidade(cliente.endereco_cidade || '');
      setEnderecoZonaRural(cliente.endereco_zona_rural || false);
      setNis(cliente.nis || '');
      setObservacoes(cliente.observacoes || '');
    } else {
      setEditId(null);
      setNome('');
      setCpf('');
      setDataNascimento('');
      setTelefone('');
      setEnderecoRua('');
      setEnderecoNumero('');
      setEnderecoBairro('');
      setEnderecoCidade('');
      setEnderecoZonaRural(false);
      setNis('');
      setObservacoes('');
    }
    setShowForm(true);
  };

  const handleMaskCpf = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleMaskTelefone = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!nome.trim()) {
      toast.error('O nome é obrigatório!');
      return;
    }

    setLoadingForm(true);

    const payload = {
      nome,
      cpf: cpf || null,
      data_nascimento: dataNascimento || null,
      telefone: telefone || null,
      endereco_rua: enderecoRua || null,
      endereco_numero: enderecoNumero || null,
      endereco_bairro: enderecoBairro || null,
      endereco_cidade: enderecoCidade || null,
      endereco_zona_rural: enderecoZonaRural,
      nis: nis || null,
      observacoes: observacoes || null,
    };

    if (editId) {
      const { error } = await supabase.from('clientes').update(payload).eq('id', editId);
      if (error) {
        console.error('Erro cliente:', error.message);
        toast.error('Erro: ' + error.message);
      } else {
        toast.success('Cliente atualizado!');
        setShowForm(false);
        fetchClientes();
      }
    } else {
      const { error } = await supabase.from('clientes').insert({
        dono_id: user.id,
        ativo: true,
        ...payload
      });
      if (error) {
        console.error('Erro cliente:', error.message);
        toast.error('Erro: ' + error.message);
      } else {
        toast.success('Cliente cadastrado!');
        setShowForm(false);
        fetchClientes();
      }
    }
    
    setLoadingForm(false);
  };

  const openPerfil = async (cliente: any) => {
    setPerfilAtivo(cliente);
    setPerfilLoading(true);

    const { data: vendas } = await supabase
      .from('vendas')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('data_venda', { ascending: false });

    if (vendas) {
      setHistoricoVendas(vendas);
      setTotalGasto(vendas.reduce((acc, v) => acc + Number(v.total), 0));
    }

    const { data: fiados } = await supabase
      .from('fiados')
      .select('*')
      .eq('cliente_id', cliente.id)
      .neq('status', 'pago')
      .order('data_vencimento', { ascending: true });

    if (fiados) setFiadosAbertos(fiados);

    setPerfilLoading(false);
  };

  const filtered = clientes.filter(c => {
    const s = search.toLowerCase();
    const matchNome = c.nome?.toLowerCase().includes(s);
    const matchCidade = c.endereco_cidade?.toLowerCase().includes(s);
    return matchNome || matchCidade;
  });

  return (
    <div className="p-4 space-y-4 pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-syne font-bold text-gray-800">Clientes</h1>
        <button 
          onClick={() => openForm()}
          className="w-10 h-10 bg-[#1a9e5c] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou cidade..." 
          className="input-field pl-12 shadow-sm border-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#1a9e5c]/30 border-t-[#1a9e5c] rounded-full animate-spin"></div>
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm mt-10">
          <div className="w-16 h-16 bg-[#dcfce7] text-[#1a9e5c] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} />
          </div>
          <p className="text-gray-500 font-medium mb-4">Nenhum cliente cadastrado ainda.</p>
          <button 
            onClick={() => openForm()}
            className="text-[#1a9e5c] font-bold underline px-4 py-2"
          >
            Adicionar primeiro cliente
          </button>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {filtered.map(cliente => (
            <div 
              key={cliente.id} 
              className="card p-4 flex items-center gap-4 hover:border-[#1a9e5c]/30 transition-colors border border-transparent overflow-hidden"
            >
              <div 
                className="w-12 h-12 bg-[#dcfce7] text-[#1a9e5c] rounded-full flex items-center justify-center font-bold text-lg shadow-sm cursor-pointer"
                onClick={() => openPerfil(cliente)}
              >
                {cliente.nome.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 cursor-pointer" onClick={() => openPerfil(cliente)}>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-base">{cliente.nome}</h3>
                  {cliente.ativo && (
                    <span className="w-2 h-2 rounded-full bg-[#1a9e5c]" title="Ativo"></span>
                  )}
                </div>
                
                <div className="flex flex-col gap-0.5 mt-1">
                  {cliente.telefone ? (
                    <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                      <Phone size={10} /> {cliente.telefone}
                    </p>
                  ) : null}
                  
                  {cliente.endereco_cidade ? (
                    <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                      <MapPin size={10} /> 
                      {cliente.endereco_cidade} 
                      {cliente.endereco_zona_rural && <span className="text-[#b45309] font-bold ml-1 bg-[#fef3c7] px-1 rounded">🌾 Zona Rural</span>}
                    </p>
                  ) : null}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openForm(cliente)} 
                  className="p-2 text-gray-400 hover:text-[#1a9e5c] transition-colors rounded-full bg-gray-50 border border-gray-100"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORMULÁRIO (CRIAR/EDITAR) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[500px] max-h-[85vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
              <h2 className="text-xl font-syne font-bold text-gray-800">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <form className="space-y-6" onSubmit={handleSave}>
              
              {/* Identificação */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1a9e5c] uppercase tracking-wider border-b border-gray-100 pb-1">👤 Identificação</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo *</label>
                  <input required type="text" className="input-field bg-gray-50 text-sm" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: Maria José" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">CPF</label>
                    <input type="text" className="input-field bg-gray-50 text-sm" value={cpf} onChange={e=>setCpf(handleMaskCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Data de Nascimento</label>
                    {/* Add max to prevent future dates, good for UX */}
                    <input type="date" max={new Date().toISOString().split('T')[0]} className="input-field bg-gray-50 text-sm text-gray-700" value={dataNascimento} onChange={e=>setDataNascimento(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                  <input type="tel" className="input-field bg-gray-50 text-sm" value={telefone} onChange={e=>setTelefone(handleMaskTelefone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1a9e5c] uppercase tracking-wider border-b border-gray-100 pb-1 flex items-center gap-1 justify-between">
                  <span><MapPin size={14} className="inline mr-1"/> Endereço</span>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#fef3c7] px-2 py-1 rounded-md text-[#b45309] normal-case tracking-normal">
                    <input type="checkbox" className="w-4 h-4 rounded text-[#b45309] focus:ring-[#b45309]" checked={enderecoZonaRural} onChange={e=>setEnderecoZonaRural(e.target.checked)} />
                    <span className="text-xs font-bold">🌾 Zona Rural</span>
                  </label>
                </h3>
                <div className="grid grid-cols-[2fr_1fr] gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rua/Logradouro</label>
                    <input type="text" className="input-field bg-gray-50 text-sm" value={enderecoRua} onChange={e=>setEnderecoRua(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Número</label>
                    <input type="text" className="input-field bg-gray-50 text-sm" value={enderecoNumero} onChange={e=>setEnderecoNumero(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
                    <input type="text" className="input-field bg-gray-50 text-sm" value={enderecoBairro} onChange={e=>setEnderecoBairro(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cidade</label>
                    <input type="text" className="input-field bg-gray-50 text-sm" value={enderecoCidade} onChange={e=>setEnderecoCidade(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Programas Sociais */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1a9e5c] uppercase tracking-wider border-b border-gray-100 pb-1">📄 Programas Sociais</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">NIS (Bolsa Família)</label>
                  <input type="text" className="input-field bg-gray-50 text-sm" value={nis} onChange={e=>setNis(e.target.value)} placeholder="Apenas números..." />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1a9e5c] uppercase tracking-wider border-b border-gray-100 pb-1">📝 Observações</h3>
                <div>
                  <textarea 
                    className="input-field bg-gray-50 text-sm resize-none h-20" 
                    value={observacoes} 
                    onChange={e=>setObservacoes(e.target.value)} 
                    placeholder="Anotações sobre o cliente, ponto de referência, etc..." 
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-semibold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="flex-1 bg-[#1a9e5c] text-white rounded-xl py-3 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingForm && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERFIL (READ-ONLY) */}
      {perfilAtivo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            {/* Header Perfil */}
            <div className="bg-[#1a9e5c] p-6 pb-8 relative text-white text-center shrink-0">
              <button type="button" onClick={() => setPerfilAtivo(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white hover:bg-white/30 transition">
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-white text-[#1a9e5c] rounded-full flex items-center justify-center font-bold text-4xl mx-auto shadow-lg mb-3">
                {perfilAtivo.nome.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-syne font-bold">{perfilAtivo.nome}</h2>
              {perfilAtivo.telefone && (
                <p className="opacity-90 flex items-center justify-center gap-1 text-sm mt-1"><Phone size={14} /> {perfilAtivo.telefone}</p>
              )}
              {perfilAtivo.endereco_cidade && (
                <p className="opacity-90 flex items-center justify-center gap-1 text-sm mt-1 mb-2">
                  <MapPin size={14} /> 
                  {perfilAtivo.endereco_cidade} 
                  {perfilAtivo.endereco_zona_rural && " (Zona Rural)"}
                </p>
              )}
            </div>

            {/* Content Tab */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#f2f6f3] space-y-4">
              {perfilLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-[#1a9e5c]/30 border-t-[#1a9e5c] rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card text-center py-4 border border-gray-100 flex flex-col items-center bg-white shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Total Comprado</p>
                      <p className="font-syne font-bold text-[#1a9e5c] text-xl">R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="card text-center py-4 border border-gray-100 flex flex-col items-center bg-[#fef2f2] shadow-sm border-[#fecaca]/40">
                      <p className="text-[10px] uppercase font-bold text-[#dc2626] tracking-wider mb-1">Dívida Ativa</p>
                      <p className="font-syne font-bold text-[#dc2626] text-xl">
                        R$ {fiadosAbertos.reduce((acc, f) => acc + Number(f.valor_restante), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Informações detalhadas do cliente no Perfil */}
                  <div className="card p-4 bg-white shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">Ficha Completa</h3>
                    <div className="space-y-2 text-xs text-gray-600">
                      {perfilAtivo.cpf && <p><strong className="text-gray-800">CPF:</strong> {perfilAtivo.cpf}</p>}
                      {perfilAtivo.data_nascimento && <p><strong className="text-gray-800">Nascimento:</strong> {new Date(perfilAtivo.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
                      {perfilAtivo.nis && <p><strong className="text-gray-800">NIS (Bolsa Família):</strong> {perfilAtivo.nis}</p>}
                      
                      {perfilAtivo.endereco_rua && (
                        <p className="mt-2 pt-2 border-t border-gray-50">
                          <strong className="text-gray-800 block mb-1">Endereço:</strong>
                          {perfilAtivo.endereco_rua}
                          {perfilAtivo.endereco_numero ? `, ${perfilAtivo.endereco_numero}` : ''}
                          {perfilAtivo.endereco_bairro ? ` - ${perfilAtivo.endereco_bairro}` : ''}
                          {perfilAtivo.endereco_cidade ? ` - ${perfilAtivo.endereco_cidade}` : ''}
                        </p>
                      )}
                      
                      {perfilAtivo.observacoes && (
                        <div className="mt-2 pt-2 border-t border-gray-50 bg-[#fffbeb] p-2 rounded text-[#b45309]">
                          <strong className="block mb-1">Observações:</strong>
                          <p className="whitespace-pre-wrap">{perfilAtivo.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fiados Pendentes */}
                  {fiadosAbertos.length > 0 && (
                    <div className="card p-5 bg-white shadow-sm border border-[#fde68a]">
                      <h3 className="font-syne font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <FileText size={18} className="text-[#b45309]" /> Fiados Pendentes
                      </h3>
                      <div className="space-y-3">
                        {fiadosAbertos.map(fiado => (
                          <div key={fiado.id} className="flex justify-between items-center p-3 bg-[#fffbeb] rounded-xl border border-[#fef3c7]">
                            <div>
                              <p className="font-bold text-[#b45309] text-sm">Venc: {new Date(fiado.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                              <p className="text-xs text-[#b45309]/80 font-medium">Status: {fiado.status}</p>
                            </div>
                            <span className="font-bold text-[#dc2626]">R$ {Number(fiado.valor_restante).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Histórico Vendas */}
                  <div className="card p-5 bg-white shadow-sm">
                    <h3 className="font-syne font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <ShoppingBag size={18} className="text-[#1a9e5c]" /> Histórico de Compras
                    </h3>
                    {historicoVendas.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhuma compra registrada.</p>
                    ) : (
                      <div className="space-y-3">
                        {historicoVendas.map(venda => (
                          <div key={venda.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-gray-800 text-sm">
                                {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${venda.tipo === 'pago' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fef3c7] text-[#b45309]'}`}>
                                {venda.tipo.toUpperCase()}
                              </span>
                            </div>
                            <span className="font-bold text-gray-800">R$ {Number(venda.total).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
