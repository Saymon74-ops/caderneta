import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCheckPlano() {
  const { user } = useAuth();
  const [plano, setPlano] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const verificar = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('plano')
        .eq('id', user.id)
        .single();
      
      setPlano(data?.plano || 'pendente');
      setLoading(false);
    };

    verificar();

    // Verifica a cada 10 segundos
    const interval = setInterval(verificar, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return { plano, loading };
}
