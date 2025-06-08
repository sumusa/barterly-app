import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (we'll expand this as we create tables)
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  description?: string
  created_at: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  skill_type: 'teach' | 'learn'
  proficiency_level: number // 1-5
  created_at: string
}

export interface SkillMatch {
  id: string
  teacher_id: string
  learner_id: string
  skill_id: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  match_id: string
  scheduled_at: string
  duration_minutes: number
  location?: string
  meeting_url?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'system'
  file_url?: string
  created_at: string
  read_at?: string
} 