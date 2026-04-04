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
    console.log('Webhook Cakto recebido:', JSON.stringify(body));

    // Eventos de pagamento aprovado
    const eventType = body.event || body.type || body.action;
    const email = body.customer?.email || body.buyer?.email || body.email;
    const status = body.status || body.payment_status;

    if (email) {
      let novoPlano = 'pendente';

      if (
        status === 'paid' || 
        status === 'approved' || 
        status === 'active' ||
        eventType === 'order.paid' ||
        eventType === 'subscription.active'
      ) {
        novoPlano = 'pro';
      } else if (
        status === 'cancelled' || 
        status === 'refunded' ||
        status === 'expired' ||
        eventType === 'subscription.cancelled' ||
        eventType === 'subscription.expired'
      ) {
        novoPlano = 'pendente';
      }

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

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (err) {
    console.error('Erro webhook Cakto:', err);
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  }
};
