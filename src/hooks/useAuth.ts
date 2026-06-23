import { useState, useEffect } from 'react'
import { type Session, type User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { type AppUser } from '../types'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [dbUser, setDbUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useAuth: Initial session:', session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchDbUser(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('useAuth: Auth state changed, event:', _event, 'user:', session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchDbUser(session.user.id)
      else { setDbUser(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchDbUser(userId: string) {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    setDbUser(data)
    setLoading(false)
  }

  async function register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
      })
    }
    return data
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { session, user, dbUser, loading, login, register, logout }
}
