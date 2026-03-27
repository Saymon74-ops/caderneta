import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // Busca fiados que vencem hoje, amanhã ou estão atrasados
    const { data: fiados, error: fiadosError } = await supabase
      .from('fiados')
      .select(`
        *,
        clientes ( nome ),
        profiles ( id ),
        fcm_tokens!inner ( token )
      `)
      .in('status', ['aberto', 'parcial'])
      .lte('data_vencimento', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString());

    if (fiadosError) throw fiadosError;

    const messages = fiados.map(fiado => {
      const isLate = new Date(fiado.data_vencimento) < new Date();
      
      const title = isLate ? 'Fiado Atrasado! 🔴' : 'Lembrete de Vencimento 🟡';
      const body = isLate 
        ? `O fiado de ${fiado.clientes.nome} está atrasado (Restante: R$${fiado.valor_restante})`
        : `O fiado de ${fiado.clientes.nome} vence em breve (Restante: R$${fiado.valor_restante})`;

      // Aqui integraria com a API oficial do Firebase Cloud Messaging para disparo de pushs
      // fetch('https://fcm.googleapis.com/v1/projects/YOUR-PROJECT-ID/messages:send', ...)

      return {
        token: fiado.fcm_tokens[0]?.token,
        title,
        body
      };
    });

    return new Response(JSON.stringify({ success: true, count: messages.length, messages }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})
