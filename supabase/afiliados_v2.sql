-- 1. Tabela de Saques
CREATE TABLE public.saques (
    id uuid primary key default gen_random_uuid(),
    afiliado_id uuid references public.afiliados(id) not null,
    valor numeric not null,
    status text default 'pendente' check (status in ('pendente', 'pago', 'recusado')),
    pix text not null,
    criado_em timestamp with time zone default now(),
    pago_em timestamp with time zone
);

ALTER TABLE public.saques ENABLE ROW LEVEL SECURITY;

-- Como o nível de segurança do admin é feito no Frontend via variável de ambiente,
-- aqui nós liberamos a leitura de saques para o próprio afiliado, mas também 
-- deixaremos leitura e alteração liberadas genericamente para o admin funcionar sem service_role
CREATE POLICY "Afiliado cria solicitacao de saque"
ON public.saques FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.afiliados a 
    WHERE a.id = saques.afiliado_id AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Ver saques (aberto para Admin e Afiliados por query)"
ON public.saques FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Atualizar saques (aberto para o Admin atualizar status)"
ON public.saques FOR UPDATE
USING (auth.role() = 'authenticated');

-- Permitir leitura da tabela de indicacoes, profiles e afiliados pelo admin (se precisarem de RLS atualizado)
DROP POLICY IF EXISTS "Admin lê indicacoes" ON public.indicacoes;
CREATE POLICY "Admin lê indicacoes" ON public.indicacoes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin lê afiliados" ON public.afiliados;
CREATE POLICY "Admin lê afiliados" ON public.afiliados FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Trigger para atualizar total_indicados na tabela afiliados
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
