import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Subscription() {
  const { profile, user } = useAuth();
  const mpCheckoutUrl = 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=371238157b4f4034a5e2830a56fcf66e';

  const [isWaiting, setIsWaiting] = useState(false);
  const [timeoutMsg, setTimeoutMsg] = useState(false);

  useEffect(() => {
    const started = sessionStorage.getItem('mp_started');
    if (started === 'true' && profile?.plano !== 'pro') {
      setIsWaiting(true);
    }
  }, [profile]);

  useEffect(() => {
    if (!isWaiting || !user) return;
    
    const interval = setInterval(async () => {
      const { data } = await supabase.from('profiles').select('plano').eq('id', user.id).single();
      if (data?.plano === 'pro') {
        sessionStorage.removeItem('mp_started');
        window.location.href = '/dashboard';
      }
    }, 5000);

    const timeOut = setTimeout(() => {
      clearInterval(interval);
      setTimeoutMsg(true);
      setIsWaiting(false);
      sessionStorage.removeItem('mp_started');
    }, 300000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeOut);
    };
  }, [isWaiting, user]);

  const handleCheckoutClick = () => {
    sessionStorage.setItem('mp_started', 'true');
  };

  if (profile?.plano === 'pro') {
    return (
      <div className="min-h-screen bg-[#f2f6f3] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="text-[#166534]" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-syne mb-2">Sua assinatura está ativa ✅</h1>
          <p className="text-gray-500 mb-8">Obrigado por utilizar o Caderneta Pro. Seu acesso está liberado.</p>
          <a
            href="https://www.mercadopago.com.br/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#1a9e5c] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all block"
          >
            Gerenciar assinatura
          </a>
          <Link to="/dashboard" className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all mt-3 block">
            Ir para o Painel
          </Link>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-[#f2f6f3] flex items-center justify-center p-6 text-center">
         <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#1a9e5c] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-syne font-bold text-gray-800 mb-2">Aguardando confirmação do pagamento...</h2>
            <p className="text-gray-500 text-sm">Isso pode levar alguns instantes. Não feche esta tela.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f6f3] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-10">
          <svg width="36" height="44" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
            <rect x="0" y="0" width="72" height="88" rx="10" fill="#1a9e5c"/>
            <rect x="0" y="0" width="14" height="88" rx="10" fill="#0d7a40"/>
            <rect x="7" y="0" width="7" height="88" fill="#0d7a40"/>
            <circle cx="14" cy="18" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="14" cy="34" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="14" cy="50" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="14" cy="66" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="24" y1="30" x2="60" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <line x1="24" y1="42" x2="60" y2="42" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <line x1="24" y1="54" x2="60" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <text x="42" y="22" textAnchor="middle" fontSize="18" fontWeight="800" fill="white" fontFamily="sans-serif">C</text>
          </svg>
          <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Syne, sans-serif'}}>
            Ative sua conta
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Acesso completo ao Caderneta por R$ 39,90/mês</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 flex flex-col items-center">
          <span className="bg-[#dcfce7] text-[#166534] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Plano Pro</span>
          
          <div className="flex items-end justify-center gap-1 mb-8">
            <span className="text-[2rem] font-extrabold text-[#1a9e5c]" style={{fontFamily: 'Syne, sans-serif'}}>R$39,90</span>
            <span className="text-xl text-gray-500 font-medium mb-1">/mês</span>
          </div>

          <ul className="space-y-4 w-full mb-10 text-gray-700">
            {[
              'Vendas e Clientes ilimitados',
              'Controle absoluto de fiados',
              'Controle de estoque completo',
              'Relatórios de faturamento',
              'Suporte VIP prioritário'
            ].map((beneficio, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="text-[#1a9e5c] shrink-0" size={24} />
                <span className="font-bold text-[15px]">{beneficio}</span>
              </li>
            ))}
          </ul>

          <a 
            href={mpCheckoutUrl}
            onClick={handleCheckoutClick}
            className="w-full bg-[#1a9e5c] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all text-center block"
          >
            Assinar agora
          </a>
          
          {timeoutMsg ? (
            <p className="text-sm font-medium text-[#dc2626] mt-4 text-center">
              Não identificamos seu pagamento ainda. Se já pagou, aguarde alguns minutos e atualize a página.
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-400 mt-4 text-center">
              Após o pagamento, aguarde alguns segundos e atualize a página.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
