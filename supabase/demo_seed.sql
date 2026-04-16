-- ==============================================================================
-- SCRIPT DE DEMONSTRAÇÃO - CADERNETA APP
-- Dono ID: 1a95df8b-0a79-4eee-bd13-acda93fa5b0c
-- ==============================================================================

-- 0. PERFIL DO USUÁRIO
-- Atualiza o perfil criado automaticamente pelo Auth
UPDATE profiles 
SET nome = 'Dona Maria'
WHERE id = '1a95df8b-0a79-4eee-bd13-acda93fa5b0c';

-- 1. CLIENTES (10 clientes reais do interior)
INSERT INTO clientes (id, dono_id, nome, ativo)
VALUES 
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'José da Silva', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Ana Oliveira', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Francisco Santos', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Maria José Souza', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Antônio Ferreira', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Raimundo Costa', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Benedita Lima', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'João Batista', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Francisca Alves', true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Pedro Henrique', true);

-- 2. PRODUTOS (10 produtos de mercearia)
INSERT INTO produtos (id, dono_id, nome, custo_unitario, preco_venda, estoque_atual, ativo)
VALUES
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Arroz 5kg', 18.00, 25.90, 45, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Feijão 1kg', 7.00, 10.90, 32, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Açúcar 2kg', 5.50, 8.90, 28, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Óleo de Soja 900ml', 6.00, 9.90, 20, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Macarrão 500g', 2.50, 4.50, 60, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Café 500g', 12.00, 18.90, 15, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Sal 1kg', 1.50, 3.90, 50, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Sabão em Pó 1kg', 8.00, 13.90, 18, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Farinha de Mandioca 1kg', 4.00, 7.90, 35, true),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Leite em Pó 400g', 14.00, 22.90, 12, true);

-- 3. VENDAS (15 vendas orgânicas espalhadas nos últimos 30 dias)
INSERT INTO vendas (id, dono_id, cliente_nome_avulso, total, tipo, data_venda)
VALUES
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 45.50, 'pago', now() - interval '2 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 15.00, 'pago', now() - interval '3 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 89.90, 'pago', now() - interval '5 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 22.50, 'pago', now() - interval '6 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 110.00, 'pago', now() - interval '8 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 34.90, 'pago', now() - interval '10 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 55.00, 'pago', now() - interval '12 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 19.90, 'pago', now() - interval '14 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 76.50, 'pago', now() - interval '15 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 120.00, 'pago', now() - interval '18 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 42.00, 'pago', now() - interval '20 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 28.50, 'pago', now() - interval '22 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 95.00, 'pago', now() - interval '25 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 63.90, 'pago', now() - interval '27 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Cliente Avulso', 38.00, 'pago', now() - interval '29 days');

-- 4. DESPESAS GERAIS
INSERT INTO despesas (id, dono_id, descricao, valor, data_despesa)
VALUES
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Aluguel', 600.00, now() - interval '2 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Energia elétrica', 180.00, now() - interval '10 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Internet', 99.90, now() - interval '15 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Embalagens', 45.00, now() - interval '20 days'),
  (gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', 'Reposição de estoque', 1200.00, now() - interval '25 days');

-- 5. FIADOS ABERTOS (Usando subqueries para atrelar direto aos recém criados)
INSERT INTO fiados (id, dono_id, cliente_id, valor_total, valor_pago, valor_restante, status, data_vencimento)
SELECT gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', id, 45.90, 0, 45.90, 'aberto', (now() + interval '7 days')
FROM clientes WHERE dono_id = '1a95df8b-0a79-4eee-bd13-acda93fa5b0c' AND nome = 'José da Silva' LIMIT 1;

INSERT INTO fiados (id, dono_id, cliente_id, valor_total, valor_pago, valor_restante, status, data_vencimento)
SELECT gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', id, 78.00, 0, 78.00, 'aberto', now()
FROM clientes WHERE dono_id = '1a95df8b-0a79-4eee-bd13-acda93fa5b0c' AND nome = 'Francisco Santos' LIMIT 1;

INSERT INTO fiados (id, dono_id, cliente_id, valor_total, valor_pago, valor_restante, status, data_vencimento)
SELECT gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', id, 32.50, 0, 32.50, 'aberto', (now() + interval '3 days')
FROM clientes WHERE dono_id = '1a95df8b-0a79-4eee-bd13-acda93fa5b0c' AND nome = 'Raimundo Costa' LIMIT 1;

INSERT INTO fiados (id, dono_id, cliente_id, valor_total, valor_pago, valor_restante, status, data_vencimento)
SELECT gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', id, 156.00, 0, 156.00, 'aberto', (now() + interval '1 days')
FROM clientes WHERE dono_id = '1a95df8b-0a79-4eee-bd13-acda93fa5b0c' AND nome = 'Ana Oliveira' LIMIT 1;

INSERT INTO fiados (id, dono_id, cliente_id, valor_total, valor_pago, valor_restante, status, data_vencimento)
SELECT gen_random_uuid(), '1a95df8b-0a79-4eee-bd13-acda93fa5b0c', id, 67.80, 0, 67.80, 'aberto', (now() + interval '5 days')
FROM clientes WHERE dono_id = '1a95df8b-0a79-4eee-bd13-acda93fa5b0c' AND nome = 'Pedro Henrique' LIMIT 1;
