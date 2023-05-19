import { createClient } from '@supabase/supabase-js' 


const supabaseUrl = "https://cqkyodyvfebrhlunnzbl.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa3lvZHl2ZmVicmhsdW5uemJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQzMjQwMDQsImV4cCI6MTk5OTkwMDAwNH0.JdMwO7yCP6VuBePTeo2Ad-NU9mjznQFq5YmaJHYxcbQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

