import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, Package, PieChart, Users, Receipt, 
  ChevronRight, X, ExternalLink, CreditCard 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showPlano, setShowPlano] = useState(false);

  const menuItens = [
    { title: 'Estoque', icon: <Package size={20} />, path: '/produtos', bg: 'bg-indigo-100/50', text: 'text-indigo-600' },
    { title: 'Relatórios', icon: <PieChart size={20} />, path: '/relatorios', bg: 'bg-emerald-100/50', text: 'text-emerald-700' },
    { title: 'Vendedores', icon: <Users size={20} />, path: '/vendedores', bg: 'bg-blue-100/50', text: 'text-blue-600' },
    { title: 'Despesas', icon: <Receipt size={20} />, path: '/despesas', bg: 'bg-rose-100/50', text: 'text-rose-600' },
    { title: 'Configurações', icon: <Settings size={20} />, path: '/configuracoes', bg: 'bg-gray-200/50', text: 'text-gray-700' },
  ];

  return (
    <div className="p-4 min-h-screen bg-[#f2f6f3] pb-24">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-[#1a9e5c] text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-md">
            {profile?.nome?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-xl font-syne font-bold text-gray-800">{profile?.nome || 'Vendedor'}</h1>
            <p className="text-sm text-gray-500 font-medium">{profile?.negocio || 'Seu Negócio'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {menuItens.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(item.path)}
            className="w-full card p-4 flex items-center justify-between hover:border-[#1a9e5c]/30 hover:shadow-md transition-all active:scale-95 border border-transparent"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.text}`}>
                {item.icon}
              </div>
              <span className="font-bold text-gray-800 text-lg">{item.title}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        ))}

        <button 
          onClick={() => setShowPlano(true)}
          className="w-full card p-4 flex items-center justify-between border-2 border-[#fef3c7] bg-[#fffbeb] hover:bg-[#fef3c7]/50 transition-colors active:scale-95"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#b45309] text-white rounded-xl flex items-center justify-center shadow-md">
              <CreditCard size={20} />
            </div>
            <span className="font-bold text-[#b45309] text-lg">Seu Plano</span>
          </div>
          <ChevronRight size={20} className="text-[#b45309]" />
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
        Caderneta v1.0.0
      </div>

      {showPlano && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[400px] rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-syne font-bold text-gray-800">Assinatura</h2>
              <button onClick={() => setShowPlano(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-[#fef3c7] border border-[#fde68a] rounded-2xl p-5 mb-6 text-center">
              <p className="text-[#b45309] font-bold text-sm uppercase tracking-wide mb-2">Plano Atual</p>
              <h3 className="font-syne font-bold text-3xl text-gray-900 mb-1">
                {profile?.plano === 'pendente' ? 'Gratuito' : 'Pro'}
              </h3>
              <p className="text-sm text-[#92400e] font-medium">Você está nos 7 dias de teste grátis.</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="font-bold text-gray-800">Ativo</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Vencimento</span>
                <span className="font-bold text-gray-800">22/04/2026</span>
              </div>
            </div>
            
            <a 
              href="https://mercadopago.com.br" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-[#1a9e5c] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Gerenciar no Mercado Pago <ExternalLink size={18} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
