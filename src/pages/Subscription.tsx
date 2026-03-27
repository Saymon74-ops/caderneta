import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Subscription() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = async () => {
    setLoading(true);
    // Simulate Mercado Pago webhook processing
    setTimeout(async () => {
      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update({ plano: 'pro' })
          .eq('id', profile.id);

        if (!error) {
          await refreshProfile();
          toast.success('Pagamento confirmado! Bem-vindo ao PRO.');
        } else {
          toast.error('Erro ao atualizar plano.');
        }
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-sm mx-auto w-full min-h-screen bg-slate-50">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={32} className="text-primary" />
        </div>
        
        <h1 className="text-2xl font-syne font-bold text-center mb-2">Desbloqueie o Caderneta</h1>
        <p className="text-center text-slate-500 text-sm mb-8">
          Sua conta foi criada! Assine agora para ter acesso completo a todas as ferramentas de gestão.
        </p>

        <div className="card w-full border-2 border-primary/20 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Plano Único
          </div>
          <div className="p-2">
            <h2 className="text-xl font-bold font-syne text-slate-800">Plano PRO</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">R$ 29</span>
              <span className="text-slate-500 font-medium text-sm">/mês</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            {['Gestão de fiados ilimitada', 'Controle de estoque automático', 'Cadastro de vendedores', 'Relatórios financeiros', 'Notificações automáticas no WhatsApp e Push'].map((feat, i) => (
              <div key={i} className="flex gap-2 items-start">
                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSimulatePayment} 
          disabled={loading}
          className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary/30"
        >
          {loading ? 'Processando...' : 'Assinar com Mercado Pago'}
        </button>

        <button 
          onClick={signOut}
          className="mt-6 text-sm text-slate-500 font-medium hover:text-slate-800"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
