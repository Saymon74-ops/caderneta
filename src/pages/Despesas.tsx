import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Receipt, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Despesas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [despesas, setDespesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('outros');
  const [dataDespesa, setDataDespesa] = useState(new Date().toISOString().split('T')[0]);
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchDespesas = async () => {
    if (!user) return;
    setLoading(true);
    
    // Lista do dia atual por padrão
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const hojeTZ = new Date(hoje.getTime() - (hoje.getTimezoneOffset() * 60000)).toISOString();
    
    const { data } = await supabase
      .from('despesas')
      .select('*')
      .gte('data_despesa', hojeTZ)
      .order('data_despesa', { ascending: false });

    if (data) setDespesas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDespesas();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const valNum = parseFloat(valor);
    if (isNaN(valNum) || valNum <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    setLoadingAction(true);
    
    // Compensa UTC pra salvar a data correta no BD se o usu informou yyyy-mm-dd
    const dataForDB = new Date(dataDespesa);
    dataForDB.setHours(12,0,0,0);
    
    const { error } = await supabase.from('despesas').insert({
      dono_id: user.id,
      descricao,
      valor: valNum,
      categoria,
      data_despesa: dataForDB.toISOString()
    });

    if (error) {
      console.error('Erro despesa:', error.message);
      toast.error('Erro: ' + error.message);
    } else {
      toast.success('Despesa registrada!');
      setShowModal(false);
      setDescricao('');
      setValor('');
      setCategoria('outros');
      fetchDespesas();
    }
    
    setLoadingAction(false);
  };

  const totalHoje = despesas.reduce((acc, d) => acc + Number(d.valor), 0);

  return (
    <div className="p-4 min-h-screen bg-[#f2f6f3] pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/menu')} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-syne font-bold text-gray-800">Despesas Diárias</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-10 h-10 bg-[#dc2626] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="bg-[#dc2626] rounded-2xl p-6 text-white shadow-lg mb-6 flex flex-col items-center relative overflow-hidden">
        <Receipt className="absolute -right-4 -top-4 opacity-10" size={100} />
        <p className="text-[#fecaca] font-medium text-sm mb-1 z-10">Total de Despesas (Hoje)</p>
        <h2 className="text-4xl font-syne font-bold z-10">R$ {totalHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center p-8 text-gray-400 font-bold">Carregando...</div>
        ) : despesas.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 text-gray-500 font-medium">
            Nenhuma despesa registrada hoje.
          </div>
        ) : (
          despesas.map((desp) => (
            <div key={desp.id} className="card p-4 flex justify-between items-center bg-white border border-[#fecaca] hover:border-[#dc2626]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fef2f2] text-[#dc2626] rounded-xl flex items-center justify-center">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{desp.descricao}</h3>
                  <p className="text-xs text-gray-500 font-medium capitalize">{desp.categoria}</p>
                </div>
              </div>
              <span className="font-bold text-[#dc2626]">R$ {Number(desp.valor).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-syne font-bold text-gray-800">Nova Despesa</h2>
              <button onClick={() => setShowModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                <input required type="text" className="input-field" placeholder="Ex: Conta de Luz, Almoço..." value={descricao} onChange={e=>setDescricao(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Valor (R$)</label>
                  <input required type="number" step="0.01" className="input-field" placeholder="0.00" value={valor} onChange={e=>setValor(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Data</label>
                  <input required type="date" className="input-field" value={dataDespesa} onChange={e=>setDataDespesa(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                <select className="input-field" value={categoria} onChange={e=>setCategoria(e.target.value)}>
                  <option value="alimentacao">Alimentação</option>
                  <option value="combustivel">Combustível</option>
                  <option value="compra_estoque">Compra de Estoque</option>
                  <option value="operacional">Custo Operacional</option>
                  <option value="outros">Outros</option>
                </select>
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
