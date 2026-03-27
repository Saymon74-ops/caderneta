import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Bell, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notificacoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotificacoes() {
      if (!user) return;
      
      const limiteFuturo = new Date();
      limiteFuturo.setDate(limiteFuturo.getDate() + 3);
      const limiteStr = limiteFuturo.toISOString().split('T')[0];

      const { data } = await supabase
        .from('fiados')
        .select('*, clientes(nome)')
        .neq('status', 'pago')
        .lte('data_vencimento', limiteStr)
        .order('data_vencimento', { ascending: true });

      if (data) setNotificacoes(data);
      setLoading(false);
    }
    fetchNotificacoes();
  }, [user]);

  return (
    <div className="p-4 min-h-screen bg-[#f2f6f3] pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-syne font-bold text-gray-800">Notificações</h1>
      </div>

      {loading ? (
        <div className="text-center p-8 font-bold text-gray-400">Carregando...</div>
      ) : notificacoes.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm mt-10">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={32} />
          </div>
          <p className="text-gray-500 font-medium">Nenhuma notificação no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((fiado) => {
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            const venc = new Date(fiado.data_vencimento);
            venc.setTime(venc.getTime() + Math.abs(venc.getTimezoneOffset() * 60000));
            venc.setHours(0,0,0,0);
            
            const diffTime = venc.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let message = '';
            let icon = null;
            let bgColor = '';
            
            if (diffDays < 0) {
              message = `O fiado de ${fiado.clientes?.nome || 'Avulso'} está ${Math.abs(diffDays)} dias atrasado.`;
              icon = <AlertTriangle className="text-[#dc2626]" size={20} />;
              bgColor = 'bg-[#fef2f2] border-[#fecaca]';
            } else if (diffDays === 0) {
              message = `O fiado de ${fiado.clientes?.nome || 'Avulso'} vence HOJE.`;
              icon = <Clock className="text-[#ea580c]" size={20} />;
              bgColor = 'bg-[#ffedd5] border-[#fed7aa]';
            } else {
              message = `O fiado de ${fiado.clientes?.nome || 'Avulso'} vence em ${diffDays} dias.`;
              icon = <Bell className="text-[#b45309]" size={20} />;
              bgColor = 'bg-[#fef3c7] border-[#fde68a]';
            }

            return (
              <div key={fiado.id} className={`p-4 rounded-xl border flex gap-4 ${bgColor} shadow-sm`}>
                <div className="mt-1">{icon}</div>
                <div>
                  <p className="font-medium text-gray-800 text-sm leading-snug">{message}</p>
                  <p className="text-xs font-bold mt-2 text-gray-500 opacity-80">
                    Valor Restante: R$ {Number(fiado.valor_restante).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
