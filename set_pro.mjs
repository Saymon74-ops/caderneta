import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmybzhupqaplpefmkvyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteWJ6aHVwcWFwbHBlZm1rdnlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ5NDIyMywiZXhwIjoyMDkwMDcwMjIzfQ.95G2XX-v3YBZD8iefES3Ow-m9PDl_xiaZeHbOODi7XE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles')
    .update({ plano: 'pro' })
    .eq('nome', 'Dona Maria')
    .select();
    
  if (error) {
     console.error("Error setting pro:", error);
  } else {
     console.log("Success! Profile updated to PRO:", data);
  }
}
run();
