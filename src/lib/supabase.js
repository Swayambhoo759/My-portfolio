import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Graceful fallback: allow the app to render even without valid Supabase credentials.
// Supabase-dependent features (projects, resume, admin) will simply show empty states.
const isValidUrl = (url) => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export const supabase = isValidUrl(supabaseUrl)
    ? createClient(supabaseUrl, supabaseKey)
    : null

// Helper that returns a no-op query builder when supabase isn't configured.
// Components call supabaseFrom('table').select() etc. and get empty results gracefully.
const noopChain = new Proxy({}, {
    get() {
        return (..._args) => noopChain
    },
})
// Always resolves with { data: null, error: null }
noopChain.then = (resolve) => resolve({ data: null, error: null })

export const supabaseFrom = (table) =>
    supabase ? supabase.from(table) : noopChain

export const supabaseStorage = (bucket) =>
    supabase ? supabase.storage.from(bucket) : {
        upload: async () => ({ error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }
