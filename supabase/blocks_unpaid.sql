UPDATE profiles SET plano = 'pendente' 
WHERE plano IS NULL OR plano = 'gratuito';
