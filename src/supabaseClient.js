import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wvdssobgszuglsguvtak.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZHNzb2Jnc3p1Z2xzZ3V2dGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3Njg1MTUsImV4cCI6MjA1ODM0NDUxNX0.Y-7idRwl5Td5eK8tULv0QS1U4Eo4ILMiC90gN8I9Tcg'

export const supabase = createClient(supabaseUrl, supabaseKey)
