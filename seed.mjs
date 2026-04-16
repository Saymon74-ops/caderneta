import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmybzhupqaplpefmkvyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteWJ6aHVwcWFwbHBlZm1rdnlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ5NDIyMywiZXhwIjoyMDkwMDcwMjIzfQ.95G2XX-v3YBZD8iefES3Ow-m9PDl_xiaZeHbOODi7XE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Iniciando criação da conta...");
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: 'maria@caderneta.app.br',
    password: 'Caderneta123!',
    email_confirm: true
  });
  
  if (authErr) {
    if (authErr.message.includes('already')) {
       console.log("A conta maria@caderneta.app.br já existe! Vamos prosseguir mesmo assim ou pare o script e delete-a.");
    } else {
       console.error("Erro no Auth:", authErr.message);
       return;
    }
  }
  
  // Pegamos o user (se criar agora ou existir)
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const mariaUser = users.find(u => u.email === 'maria@caderneta.app.br');
  if (!mariaUser) return console.log("Usuário não encontrado.");
  
  const userId = mariaUser.id;
  console.log("ID da Dona Maria:", userId);
  
  // Esperar a trigger de profile disparar
  await new Promise(r => setTimeout(r, 2000));
  await supabase.from('profiles').update({ nome: 'Dona Maria' }).eq('id', userId);
  
  console.log("Inserindo Clientes...");
  const cls = ['José da Silva', 'Ana Oliveira', 'Francisco Santos', 'Maria José Souza', 'Antônio Ferreira', 'Raimundo Costa', 'Benedita Lima', 'João Batista', 'Francisca Alves', 'Pedro Henrique'].map(nome => ({
    dono_id: userId, nome, ativo: true
  }));
  const { data: insertedClients, error: errC } = await supabase.from('clientes').insert(cls).select();
  if (errC) console.error("Erro Clientes:", errC);
  
  console.log("Inserindo Produtos...");
  const prods = [
    {nome: 'Arroz 5kg', custo: 18.00, preco_venda: 25.90, estoque_atual: 45},
    {nome: 'Feijão 1kg', custo: 7.00, preco_venda: 10.90, estoque_atual: 32},
    {nome: 'Açúcar 2kg', custo: 5.50, preco_venda: 8.90, estoque_atual: 28},
    {nome: 'Óleo de Soja 900ml', custo: 6.00, preco_venda: 9.90, estoque_atual: 20},
    {nome: 'Macarrão 500g', custo: 2.50, preco_venda: 4.50, estoque_atual: 60},
    {nome: 'Café 500g', custo: 12.00, preco_venda: 18.90, estoque_atual: 15},
    {nome: 'Sal 1kg', custo: 1.50, preco_venda: 3.90, estoque_atual: 50},
    {nome: 'Sabão em Pó 1kg', custo: 8.00, preco_venda: 13.90, estoque_atual: 18},
    {nome: 'Farinha de Mandioca 1kg', custo: 4.00, preco_venda: 7.90, estoque_atual: 35},
    {nome: 'Leite em Pó 400g', custo: 14.00, preco_venda: 22.90, estoque_atual: 12}
  ].map(p => ({...p, dono_id: userId, ativo: true, unidade: 'un'}));
  
  const {error: errP} = await supabase.from('produtos').insert(prods);
  if (errP) console.error("Erro Produtos:", errP);
  
  console.log("Inserindo Vendas e Despesas...");
  const d = (daysAgo) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - daysAgo);
    return dt.toISOString();
  };
  
  const vendas = [
    {total: 45.5, dias: 2}, {total: 15.0, dias: 3}, {total: 89.9, dias: 5}, {total: 22.5, dias: 6},
    {total: 110.0, dias: 8}, {total: 34.9, dias: 10}, {total: 55.0, dias: 12}, {total: 19.9, dias: 14},
    {total: 76.5, dias: 15}, {total: 120.0, dias: 18}, {total: 42.0, dias: 20}, {total: 28.5, dias: 22},
    {total: 95.0, dias: 25}, {total: 63.9, dias: 27}, {total: 38.0, dias: 29}
  ].map(v => ({ dono_id: userId, cliente_nome_avulso: 'Cliente Avulso', total: v.total, tipo: 'pago', data_venda: d(v.dias) }));
  
  await supabase.from('vendas').insert(vendas);
  
  const despesas = [
    {descricao: 'Aluguel', valor: 600, dias: 2},
    {descricao: 'Energia Elétrica', valor: 180, dias: 10},
    {descricao: 'Internet', valor: 99.9, dias: 15},
    {descricao: 'Embalagens', valor: 45, dias: 20},
    {descricao: 'Reposição de estoque', valor: 1200, dias: 25}
  ].map(item => ({dono_id: userId, descricao: item.descricao, valor: item.valor, data_despesa: d(item.dias) }));
  
  await supabase.from('despesas').insert(despesas);
  
  console.log("Inserindo Fiados...");
  const findCli = (name) => insertedClients?.find(c => c.nome === name)?.id;
  const v = (daysFwd) => { const dt = new Date(); dt.setDate(dt.getDate() + daysFwd); return dt.toISOString(); };
  
  const fiados = [
    {cliente_id: findCli('José da Silva'), valor_total: 45.90, data_vencimento: v(7)},
    {cliente_id: findCli('Francisco Santos'), valor_total: 78.00, data_vencimento: v(0)},
    {cliente_id: findCli('Raimundo Costa'), valor_total: 32.50, data_vencimento: v(3)},
    {cliente_id: findCli('Ana Oliveira'), valor_total: 156.00, data_vencimento: v(1)},
    {cliente_id: findCli('Pedro Henrique'), valor_total: 67.80, data_vencimento: v(5)}
  ].filter(f => f.cliente_id).map(f => ({
    dono_id: userId,
    cliente_id: f.cliente_id,
    valor_total: f.valor_total,
    valor_pago: 0,
    valor_restante: f.valor_total,
    status: 'aberto',
    data_vencimento: f.data_vencimento
  }));
  
  await supabase.from('fiados').insert(fiados);
  
  console.log("TUDO PRONTO! ✅");
  console.log("Email: maria@caderneta.app.br");
  console.log("Senha: Caderneta123!");
}
run();
