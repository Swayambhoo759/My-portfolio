import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// ── Diagnostic: log whether Supabase credentials are present at build time ──
console.log('[Supabase] URL configured:', !!supabaseUrl && supabaseUrl !== '', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '(empty)')
console.log('[Supabase] Key configured:', !!supabaseKey && supabaseKey !== '')

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

const urlValid = isValidUrl(supabaseUrl)
console.log('[Supabase] URL passes isValidUrl:', urlValid)

export const supabase = urlValid
    ? createClient(supabaseUrl, supabaseKey)
    : null

console.log('[Supabase] Client created:', supabase !== null)

// Helper that returns a no-op query builder when supabase isn't configured.
// Components call supabaseFrom('table').select() etc. and get empty results gracefully.
const noopResult = Promise.resolve({ data: null, error: null })
const noopChain = new Proxy({}, {
    get(_target, prop) {
        // Make the proxy a proper thenable so await works correctly
        if (prop === 'then') return (resolve, reject) => noopResult.then(resolve, reject)
        if (prop === 'catch') return (reject) => noopResult.catch(reject)
        if (prop === 'finally') return (cb) => noopResult.finally(cb)
        return (..._args) => noopChain
    },
})

export const supabaseFrom = (table) => {
    if (!supabase) console.warn('[Supabase] Not configured — using fallback for table:', table)
    return supabase ? supabase.from(table) : noopChain
}

export const supabaseStorage = (bucket) => {
    if (!supabase) console.warn('[Supabase] Not configured — using fallback for storage:', bucket)
    return supabase ? supabase.storage.from(bucket) : {
        upload: async () => ({ error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }
}
