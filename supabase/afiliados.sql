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

-- ==========================================
-- 6. TABELA SAQUES
-- ==========================================
CREATE TABLE IF NOT EXISTS saques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliado_id uuid REFERENCES afiliados(id),
  valor numeric DEFAULT 0,
  status text DEFAULT 'pendente',
  pix text,
  criado_em timestamp DEFAULT now(),
  pago_em timestamp
);

ALTER TABLE saques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Afiliado vê seus próprios saques"
ON saques FOR SELECT
USING (afiliado_id IN (
  SELECT id FROM afiliados WHERE user_id = auth.uid()
));

CREATE POLICY "Afiliado insere seus próprios saques"
ON saques FOR INSERT
WITH CHECK (afiliado_id IN (
  SELECT id FROM afiliados WHERE user_id = auth.uid()
));

-- 7. RLS de Admin para visualização no Painel /admin
CREATE POLICY "Admin lê saques" ON saques FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin atualiza saques" ON saques FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin lê indicacoes" ON indicacoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin lê afiliados" ON afiliados FOR SELECT USING (auth.role() = 'authenticated');

-- 8. Trigger para auto incrementar o total_indicados na tabela afiliados
CREATE OR REPLACE FUNCTION update_total_indicados()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'ativo') THEN
        UPDATE public.afiliados SET total_indicados = total_indicados + 1 WHERE id = NEW.afiliado_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status != 'ativo' AND NEW.status = 'ativo') THEN
            UPDATE public.afiliados SET total_indicados = total_indicados + 1 WHERE id = NEW.afiliado_id;
        ELSIF (OLD.status = 'ativo' AND NEW.status != 'ativo') THEN
            UPDATE public.afiliados SET total_indicados = total_indicados - 1 WHERE id = NEW.afiliado_id;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'ativo') THEN
        UPDATE public.afiliados SET total_indicados = total_indicados - 1 WHERE id = OLD.afiliado_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_total_indicados_trigger ON public.indicacoes;
CREATE TRIGGER update_total_indicados_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.indicacoes
FOR EACH ROW EXECUTE FUNCTION update_total_indicados();
