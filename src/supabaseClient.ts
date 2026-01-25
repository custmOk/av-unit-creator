import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tufjxjqnqigpanehrsaz.supabase.co'
const supabaseKey = 'sb_publishable_8noWyVpCpQS7V-HfTodoEQ_Uj7zVbZJ'

export const supabase = createClient(supabaseUrl, supabaseKey)