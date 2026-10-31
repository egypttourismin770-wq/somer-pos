import { createClient } from '@supabase/supabase-js'

// Public publishable key only. Never place service_role or secret keys in frontend code.
const SUPABASE_URL = 'https://lwpbbkgicukgwbfiantb.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_DAOmhhtBOA8XvDF93r5F1A_o0iVYK3Y'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export const PRODUCT_BUCKET = 'somer-product-images'
