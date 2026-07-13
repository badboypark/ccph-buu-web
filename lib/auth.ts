import { getServiceSupabase } from './supabase';
import bcrypt from 'bcryptjs';

export async function checkAuth(username: string, password: string) {
  const db = getServiceSupabase();
  const { data } = await db
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('active', true)
    .single();

  if (!data) return null;
  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) return null;

  // Update last login
  await db.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.id);

  return { username: data.username, role: data.role, name: data.name, email: data.email };
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}
