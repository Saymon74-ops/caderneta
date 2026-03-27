import { useState, useEffect } from 'react';
import { Plus, Percent, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Vendedores() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [vendedores, setVendedores] = useState<any[]>([]);

  // Form
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [comissao, setComissao] = useState('');
  const [soPagos, setSoPagos] = useState(false);

  const fetchVendedores = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('vendedores').select('*').order('nome');
    if (data) setVendedores(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVendedores();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoadingAction(true);
    const { error } = await supabase.from('vendedores').insert({
      dono_id: user.id,
      nome,
      telefone,
      comissao: parseFloat(comissao) || 0,
      so_pagos: soPagos
    });

    if (error) {
      console.error('Erro vendedor:', error.message);
      toast.error('Erro: ' + error.message);
    } else {
      toast.success('Salvo com sucesso!');
      setShowModal(false);
      setNome('');
      setTelefone('');
      setComissao('');
      setSoPagos(false);
      fetchVendedores();
    }
    setLoadingAction(false);
  };

  return (
    <div className="p-4 space-y-4 pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-syne font-bold text-gray-800">Equipe</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="w-10 h-10 bg-[#1a9e5c] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-8 text-gray-400 font-bold">Carregando equipe...</div>
        ) : vendedores.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 text-gray-500 font-medium">
            Nenhum vendedor cadastrado.
          </div>
        ) : vendedores.map(vendedor => (
          <div key={vendedor.id} className="card p-0 overflow-hidden border border-gray-100 group">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2563eb]/10 text-[#2563eb] rounded-2xl flex items-center justify-center font-bold text-xl">
                  {vendedor.nome?.charAt(0) || 'V'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-0.5">{vendedor.nome}</h3>
                  <p className="text-xs text-gray-500 font-medium">{vendedor.telefone}</p>
                </div>
              </div>
              <div className="text-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Comissão</p>
                <p className="font-syne font-bold text-[#1a9e5c] flex items-center gap-0.5 justify-center text-xl">
                  {vendedor.comissao}<Percent size={14} strokeWidth={3} className="text-[#1a9e5c]" />
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 border-t border-gray-100 p-4 flex flex-col items-center">
               <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Vendido (Estimativa Front)</p>
               <p className="font-bold text-gray-800 text-lg sm:text-base">R$ {(vendedor.total_vendido || 0).toFixed(2)}</p>
            </div>

            {vendedor.so_pagos && (
               <div className="bg-[#fffbeb] text-[#b45309] text-xs font-bold text-center py-2 px-4 shadow-inner flex items-center justify-center gap-2">
                 <Check size={14} strokeWidth={3} /> Comissão calculada apenas sobre recebimentos
               </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-syne font-bold text-gray-800">Novo Vendedor</h2>
              <button onClick={() => setShowModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                <input required type="text" className="input-field bg-gray-50 border-gray-200" placeholder="Ex: Roberto Silva" value={nome} onChange={e=>setNome(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
                  <input required type="tel" className="input-field bg-gray-50 border-gray-200" placeholder="(11) 90000-0000" value={telefone} onChange={e=>setTelefone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">% Comissão</label>
                  <div className="relative">
                    <input required type="number" step="0.1" className="input-field pr-10 bg-gray-50 border-gray-200" placeholder="0" value={comissao} onChange={e=>setComissao(e.target.value)} />
                    <Percent size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl border-2 border-gray-200 flex items-center justify-between cursor-pointer" onClick={() => setSoPagos(!soPagos)}>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Só em Vendas Pagas?</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Calcula comissão apenas se o cliente já pagou</p>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${soPagos ? 'bg-[#1a9e5c]' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${soPagos ? 'translate-x-6' : 'translate-x-0'}`}></div>
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
                  disabled={loadingAction}
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
