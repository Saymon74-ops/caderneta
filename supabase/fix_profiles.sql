INSERT INTO profiles (id, nome, negocio, plano)
VALUES 
  ('a717252d-bd5b-4565-8440-0ca7d49e915a', 'fghofgfdjsok', 'Meu Negócio', 'gratuito'),
  ('2baa2a6a-ca23-4ae3-9160-fb3ab2c913e0', 'saymon.xbox', 'Meu Negócio', 'gratuito')
ON CONFLICT (id) DO NOTHING;
