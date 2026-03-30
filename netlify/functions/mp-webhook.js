const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metodo Nao Permitido' };
  }

  try {
    const body = JSON.parse(event.body);
    const { type, action, data } = body;

    if (type !== 'subscription_preapproval') {
      return { statusCode: 200, body: 'Notificacao Diferente Ignorada' };
    }

    const preapprovalId = data?.id || body?.data?.id;
    if (!preapprovalId) return { statusCode: 400, body: 'Sem identificador UUID.' };

    const mpToken = process.env.MP_ACCESS_TOKEN;
    const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${mpToken}` }
    });
    
    if (!response.ok) {
        return { statusCode: 500, body: 'Erro fatal comunicando via API do Mercado Pago' };
    }

    const subscription = await response.json();
    const status = subscription.status;
    const payerEmail = subscription.payer_email;

    if (!payerEmail) return { statusCode: 200, body: 'Payload omitiu email.' };

    const { data: usersData, error: apiErr } = await supabase.auth.admin.listUsers();
    if (apiErr) return { statusCode: 500, body: 'Query de Administracao Auth rejeitada' };

    const targetUser = usersData.users.find(u => u.email === payerEmail);
    if (!targetUser) return { statusCode: 200, body: 'Nao reflete nossa Userbase. Acao finalizada.' };

    let novoPlano = 'pendente';
    if (status === 'authorized') {
       novoPlano = 'pro';
    } else if (status === 'cancelled' || status === 'paused') {
       novoPlano = 'pendente';
    }

    const { error: profErr } = await supabase.from('profiles').update({ plano: novoPlano }).eq('id', targetUser.id);
    if (profErr) return { statusCode: 500, body: 'Falha gravissima cruzando tabelas locais.' };

    return { statusCode: 200, body: 'Success 100%' };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Server side panic.' };
  }
};
