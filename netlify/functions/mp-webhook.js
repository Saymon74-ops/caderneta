const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('Webhook recebido:', JSON.stringify(body));

    const { type, data } = body;

    if (type === 'subscription_preapproval' && data?.id) {
      const preapprovalId = data.id;

      // Busca detalhes da assinatura no Mercado Pago
      const mpResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${preapprovalId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
          }
        }
      );

      const subscription = await mpResponse.json();
      console.log('Assinatura MP:', JSON.stringify(subscription));

      const email = subscription?.payer_email;
      const status = subscription?.status;

      if (email) {
        const novoPlano = status === 'authorized' ? 'pro' : 'pendente';

        // Busca usuário pelo email
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === email);

        if (user) {
          await supabase
            .from('profiles')
            .update({ plano: novoPlano })
            .eq('id', user.id);
          
          console.log(`Plano de ${email} atualizado para ${novoPlano}`);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (err) {
    console.error('Erro webhook:', err);
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  }
};
