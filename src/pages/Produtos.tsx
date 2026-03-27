import { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, X, Edit, PlusSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Produtos() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [custo, setCusto] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [unidade, setUnidade] = useState('un');

  const fetchProd = async () => {
    setLoading(true);
    const { data } = await supabase.from('produtos').select('*').order('nome');
    if (data) setProdutos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProd();
  }, []);

  const openForm = (prod?: any) => {
    if (prod) {
      setEditId(prod.id);
      setNome(prod.nome);
      setCusto(prod.custo?.toString() || '0');
      setPreco(prod.preco?.toString() || '0');
      setEstoque(prod.estoque_atual?.toString() || '0');
      setUnidade(prod.unidade || 'un');
    } else {
      setEditId(null);
      setNome('');
      setCusto('');
      setPreco('');
      setEstoque('');
      setUnidade('un');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Only used for update, but mapping UI correctly
    const payloadUpdate = {
      nome,
      custo: parseFloat(custo),
      preco_venda: parseFloat(preco),
      estoque_atual: parseInt(estoque, 10),
      unidade: unidade || 'un'
    };

    if (editId) {
      const { error } = await supabase.from('produtos').update(payloadUpdate).eq('id', editId);
      if (error) {
        console.error('Erro produto:', error.message);
        toast.error('Erro: ' + error.message);
      } else {
        toast.success('Produto atualizado!');
        setShowModal(false);
        fetchProd();
      }
    } else {
      const { error } = await supabase.from('produtos').insert({
        dono_id: user.id,
        nome: nome,
        custo: Number(custo),
        preco_venda: Number(preco),
        estoque_atual: Number(estoque),
        unidade: unidade || 'un'
      });
      if (error) {
        console.error('Erro produto:', error.message);
        toast.error('Erro: ' + error.message);
      } else {
        toast.success('Produto criado!');
        setShowModal(false);
        fetchProd();
      }
    }
  };

  const quickIncrement = async (id: string, atual: number) => {
    const newVal = atual + 1;
    const { error } = await supabase.from('produtos').update({ estoque_atual: newVal }).eq('id', id);
    if (!error) {
      toast.success('+1 adicionado ao estoque');
      setProdutos(produtos.map(p => p.id === id ? { ...p, estoque_atual: newVal } : p));
    }
  };

  const filtered = produtos.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 space-y-4 pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-syne font-bold text-gray-800">Estoque</h1>
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
          placeholder="Buscar produto ou código..." 
          className="input-field pl-12 shadow-sm border-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-400 font-bold">Carregando...</div>
      ) : (
        <div className="space-y-3 mt-4">
          {filtered.map(produto => {
            const numEstoque = produto.estoque_atual || 0;
            return (
              <div key={produto.id} className="card p-4 flex flex-col justify-between hover:border-[#1a9e5c]/30 transition-colors border border-transparent gap-4 relative overflow-hidden">
                {numEstoque < 5 && (
                  <div className="absolute top-0 right-0 bg-[#b45309] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                    <AlertTriangle size={12} /> ESTOQUE BAIXO
                  </div>
                )}
                
                <div className="flex justify-between items-start mt-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${numEstoque < 5 ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-[#dcfce7] text-[#1a9e5c]'}`}>
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                        {produto.nome}
                      </h3>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">Custo: R$ {Number(produto.custo || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openForm({
                    ...produto,
                    preco: produto.preco_venda // Map explicitly since UI uses preco
                  })} className="p-2 text-gray-400 hover:text-[#1a9e5c] transition-colors rounded-full bg-gray-50 border border-gray-100">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Estoque Atual</p>
                      <p className={`font-syne font-bold text-lg mt-0.5 ${numEstoque < 5 ? 'text-[#dc2626]' : 'text-[#1a9e5c]'}`}>
                        {numEstoque} <span className="text-sm">({produto.unidade})</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => quickIncrement(produto.id, numEstoque)}
                      className="ml-2 bg-[#dcfce7] text-[#166534] w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border border-[#bbf7d0] active:scale-95 transition-all"
                      title="Reposição Rápida +1"
                    >
                      <PlusSquare size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Preço de Venda</p>
                    <p className="font-syne font-bold text-lg text-gray-800 mt-0.5">R$ {Number(produto.preco_venda || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-syne font-bold text-gray-800">{editId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto</label>
                <input required type="text" className="input-field bg-gray-50 border-gray-200" value={nome} onChange={e=>setNome(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Custo Unitário</label>
                  <input required type="number" step="0.01" className="input-field bg-gray-50 border-gray-200" value={custo} onChange={e=>setCusto(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preço de Venda</label>
                  <input required type="number" step="0.01" className="input-field bg-gray-50 border-gray-200" value={preco} onChange={e=>setPreco(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Estoque Inicial/Atual</label>
                  <input required type="number" className="input-field bg-gray-50 border-gray-200" value={estoque} onChange={e=>setEstoque(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Unidade</label>
                  <select className="input-field bg-gray-50 border-gray-200" value={unidade} onChange={e=>setUnidade(e.target.value)}>
                    <option value="un">Unidade (un)</option>
                    <option value="kg">Quilo (kg)</option>
                    <option value="g">Grama (g)</option>
                    <option value="cx">Caixa (cx)</option>
                    <option value="par">Par (par)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-semibold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1a9e5c] text-white rounded-xl py-3 font-semibold text-sm active:scale-95 transition-transform"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
