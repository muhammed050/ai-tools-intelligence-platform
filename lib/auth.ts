import { createClient } from '@/lib/supabase/server'

export async function getUser(){
  try {
    const s=await createClient(); const {data,error}=await s.auth.getUser()
    return error ? null : data.user
  } catch { return null }
}

export async function getProfile(){
  try {
    const user=await getUser(); if(!user)return null
    const s=await createClient(); const {data}=await s.from('profiles').select('*').eq('id',user.id).maybeSingle()
    return data ?? null
  } catch { return null }
}

export async function requireUser(){const user=await getUser();if(!user)throw new Error('UNAUTHENTICATED');return user}
export async function requireRole(roles:string[]){const user=await requireUser();const profile=await getProfile();if(!profile||!roles.includes(profile.role))throw new Error('FORBIDDEN');return{user,profile}}
export async function requireAdmin(){return requireRole(['admin'])}
export async function requireEditor(){return requireRole(['admin','editor'])}
