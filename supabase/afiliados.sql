-- 1. Tabela afiliados
CREATE TABLE public.afiliados (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    codigo text unique not null,
    nome text not null,
    pix text not null,
    total_indicados integer default 0,
    total_ganho numeric default 0,
    criado_em timestamp with time zone default now()
);

-- 2. Tabela indicacoes
CREATE TABLE public.indicacoes (
    id uuid primary key default gen_random_uuid(),
    afiliado_id uuid references public.afiliados(id) not null,
    cliente_user_id uuid references auth.users not null,
    status text default 'ativo' check (status in ('ativo', 'cancelado')),
    valor_comissao numeric default 19.95,
    criado_em timestamp with time zone default now()
);

-- 3. Alterar perfil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS codigo_afiliado text;

-- 4. RLS - Afiliados
ALTER TABLE public.afiliados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver próprios dados de afiliado"
ON public.afiliados FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Inserir próprio cadastro de afiliado"
ON public.afiliados FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Atualizar próprio cadastro de afiliado"
ON public.afiliados FOR UPDATE
USING (auth.uid() = user_id);

-- 5. RLS - Indicações
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Afiliado pode ver suas indicações"
ON public.indicacoes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.afiliados a 
    WHERE a.id = indicacoes.afiliado_id AND a.user_id = auth.uid()
  )
);
