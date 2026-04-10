import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmybzhupqaplpefmkvyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteWJ6aHVwcWFwbHBlZm1rdnlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ5NDIyMywiZXhwIjoyMDkwMDcwMjIzfQ.95G2XX-v3YBZD8iefES3Ow-m9PDl_xiaZeHbOODi7XE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const email = 'testadorqa1@test.com';
  
  const { data: { users }, error: errAdmin } = await supabase.auth.admin.listUsers();
  if (errAdmin) throw errAdmin;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log("User not found");
    process.exit(1);
  }
  
  console.log(`Found user ${user.id}`);
  await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
  console.log(`Email confirmed for ${email}`);
  
  const { error: errPro } = await supabase.from('profiles').update({ plano: 'pro' }).eq('id', user.id);
  if (errPro) throw errPro;
  console.log(`Plan upgraded to pro for ${email}`);
}
run();
