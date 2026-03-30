ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plano text DEFAULT 'pendente';
UPDATE profiles SET plano = 'pendente' WHERE plano = 'gratuito' OR plano IS NULL;
