import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  if (error) throw error

  // Create profile row
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      email,
      role: 'member',
      plan: 'free',
      created_at: new Date().toISOString()
    })
  }
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getProfile = async (userId, userDetails) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error && error.code === 'PGRST116') {
    // No profile found - user confirmed email and just logged in, so we create it now
    const email = userDetails?.email || '';
    const name = userDetails?.user_metadata?.full_name || email.split('@')[0] || 'User';
    
    const { data: newProfile, error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: name,
      email: email,
      role: 'member',
      plan: 'free'
    }).select().single();
    
    if (insertError) throw insertError;
    return newProfile;
  }
  
  if (error) throw error
  return data
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
