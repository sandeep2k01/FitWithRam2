import { create } from 'zustand'
import { supabase, getProfile } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,

  init: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await getProfile(session.user.id, session.user)
        set({
          user: session.user,
          profile,
          isAdmin: profile?.role === 'admin',
          loading: false
        })
      } else {
        set({ loading: false })
      }
    } catch (e) {
      console.error('Session init error:', e)
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const profile = await getProfile(session.user.id, session.user)
          set({
            user: session.user,
            profile,
            isAdmin: profile?.role === 'admin',
            loading: false
          })
        } else {
          set({ user: null, profile: null, isAdmin: false, loading: false })
        }
      } catch (e) {
        console.error('Auth state change error:', e)
        set({ loading: false })
      }
    })
  },

  setProfile: (profile) => set({ profile, isAdmin: profile?.role === 'admin' }),
  clear: () => set({ user: null, profile: null, isAdmin: false })
}))
