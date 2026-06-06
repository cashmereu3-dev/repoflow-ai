import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Creating admin user...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'admin@repoflowai.online',
    password: '123456',
    options: {
      data: {
        full_name: 'System Admin'
      }
    }
  });

  if (authError) {
    console.error('Error creating user:', authError.message);
    return;
  }

  console.log('User created:', authData.user.id);
  
  // Wait for the auth trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Update profile to administrator
  const { data: profileUpdate, error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'administrator' })
    .eq('id', authData.user.id);

  if (profileError) {
    console.error('Error updating profile role:', profileError.message);
    console.log('Attempting to create profile manually...');
    await supabase.from('profiles').insert({
        id: authData.user.id,
        email: 'admin@repoflowai.online',
        role: 'administrator',
        full_name: 'System Admin'
    });
  }

  console.log('Admin account created successfully!');
}

main();
