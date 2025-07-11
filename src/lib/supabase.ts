import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zumworssiscyfselxbek.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// TODO: Add your actual Supabase credentials to .env.local file
if (supabaseUrl === 'your-supabase-anon-key' || supabaseAnonKey === 'your-supabase-anon-key') {
  console.warn('⚠️ Using fallback Supabase credentials. Please create .env.local file with your actual credentials.')
}

// Create a singleton instance to prevent multiple clients
let supabaseInstance: SupabaseClient | null = null

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'barterly-auth-token'
      }
    })
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Database types matching our schema
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  bio?: string
  location?: string
  timezone: string
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
  description?: string
  created_at: string
  // Joined data
  skill?: Skill
  user?: User
}

export interface SkillMatch {
  id: string
  teacher_id: string
  learner_id: string
  skill_id: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  message?: string
  created_at: string
  updated_at: string
  // Joined data
  teacher?: User
  learner?: User
  skill?: Skill
}

export interface Session {
  id: string
  match_id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  location?: string
  meeting_url?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
  // Joined data
  skill_match?: SkillMatch
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
  // Joined data
  sender?: User
}

export interface Review {
  id: string
  session_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number // 1-5
  comment?: string
  created_at: string
  // Joined data
  reviewer?: User
  reviewee?: User
  session?: Session
}

export interface RecommendedMatch {
  teacher_id: string
  teacher_name: string
  teacher_email: string
  skill_name: string
  skill_category: string
  proficiency_level: number
  teacher_bio?: string
  teacher_location?: string
  compatibility_score: number
  match_reason: string
}

// Database helper functions
export const db = {
  // Users
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      return null
    }
    return data
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      return null
    }
    return data
  },

  // Skills
  async getSkills(): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching skills:', error)
      return []
    }
    return data || []
  },

  async getSkillsByCategory(): Promise<Record<string, Skill[]>> {
    const skills = await this.getSkills()
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, Skill[]>)
  },

  async createSkill(skill: Omit<Skill, 'id' | 'created_at'>): Promise<Skill | null> {
    const { data, error } = await supabase
      .from('skills')
      .insert(skill)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error creating skill:', error)
      return null
    }
    return data
  },

  async getSkillMetrics(skillId: string): Promise<{
    teacherCount: number
    learnerCount: number
    averageRating: number
  }> {
    // Get teacher and learner counts
    const { data: skillCounts, error: countsError } = await supabase
      .from('user_skills')
      .select('skill_type')
      .eq('skill_id', skillId)

    if (countsError) {
      console.error('Error fetching skill counts:', countsError)
      return { teacherCount: 0, learnerCount: 0, averageRating: 0 }
    }

    const teacherCount = skillCounts?.filter(s => s.skill_type === 'teach').length || 0
    const learnerCount = skillCounts?.filter(s => s.skill_type === 'learn').length || 0

    // Get average rating from actual reviews
    const { data: teachers, error: teachersError } = await supabase
      .from('user_skills')
      .select('user_id')
      .eq('skill_id', skillId)
      .eq('skill_type', 'teach')

    let averageRating = 0
    if (!teachersError && teachers && teachers.length > 0) {
      const teacherIds = teachers.map(t => t.user_id)
      
      // Get reviews for all teachers of this skill
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .in('reviewee_id', teacherIds)

      if (!reviewsError && reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        averageRating = Math.round((totalRating / reviews.length) * 10) / 10
      } else {
        // Fallback to proficiency-based rating if no reviews
        const { data: teacherSkills, error: teacherSkillsError } = await supabase
          .from('user_skills')
          .select('proficiency_level')
          .eq('skill_id', skillId)
          .eq('skill_type', 'teach')

        if (!teacherSkillsError && teacherSkills && teacherSkills.length > 0) {
          const totalProficiency = teacherSkills.reduce((sum, teacher) => sum + teacher.proficiency_level, 0)
          // Convert proficiency (1-4) to rating (1-5)
          averageRating = Math.round((totalProficiency / teacherSkills.length * 1.25) * 10) / 10
        }
      }
    }

    return { teacherCount, learnerCount, averageRating }
  },

  // User Skills
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user skills:', error)
      return []
    }
    return data || []
  },

  async addUserSkill(userSkill: Omit<UserSkill, 'id' | 'created_at'>): Promise<UserSkill | null> {
    const { data, error } = await supabase
      .from('user_skills')
      .insert(userSkill)
      .select(`
        *,
        skill:skills(*)
      `)
      .single()
    
    if (error) {
      console.error('Error adding user skill:', error)
      return null
    }
    return data
  },

  async updateUserSkill(id: string, updates: Partial<Pick<UserSkill, 'proficiency_level' | 'description'>>): Promise<UserSkill | null> {
    const { data, error } = await supabase
      .from('user_skills')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        skill:skills(*),
        user:users(*)
      `)
      .single()
    
    if (error) {
      console.error('Error updating user skill:', error)
      return null
    }
    return data
  },

  async removeUserSkill(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error removing user skill:', error)
      return false
    }
    return true
  },

  // Skills matching
  async findPotentialMatches(userId: string, skillId: string): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        user:users(*),
        skill:skills(*)
      `)
      .eq('skill_id', skillId)
      .eq('skill_type', 'teach')
      .neq('user_id', userId)
    
    if (error) {
      console.error('Error finding matches:', error)
      return []
    }
    return data || []
  },

  // Skill Matches
  async createSkillMatch(match: Omit<SkillMatch, 'id' | 'created_at' | 'updated_at'>): Promise<SkillMatch | null> {
    const { data, error } = await supabase
      .from('skill_matches')
      .insert(match)
      .select(`
        *,
        teacher:users!teacher_id(*),
        learner:users!learner_id(*),
        skill:skills(*)
      `)
      .single()
    
    if (error) {
      console.error('Error creating skill match:', error)
      return null
    }
    return data
  },

  async getSkillMatches(userId: string): Promise<SkillMatch[]> {
    const { data, error } = await supabase
      .from('skill_matches')
      .select(`
        *,
        teacher:users!teacher_id(*),
        learner:users!learner_id(*),
        skill:skills(*)
      `)
      .or(`teacher_id.eq.${userId},learner_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching skill matches:', error)
      return []
    }
    return data || []
  },

  async updateSkillMatchStatus(id: string, status: SkillMatch['status']): Promise<SkillMatch | null> {
    const { data, error } = await supabase
      .from('skill_matches')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        teacher:users!teacher_id(*),
        learner:users!learner_id(*),
        skill:skills(*)
      `)
      .single()
    
    if (error) {
      console.error('Error updating skill match:', error)
      return null
    }
    return data
  },

  // Messages
  async getMessages(matchId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(*)
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }
    return data || []
  },

  async sendMessage(message: Omit<Message, 'id' | 'created_at' | 'read_at'>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select(`
        *,
        sender:users!sender_id(*)
      `)
      .single()
    
    if (error) {
      console.error('Error sending message:', error)
      return null
    }
    return data
  },

  // Sessions
  async createSession(session: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error creating session:', error)
      return null
    }
    return data
  },

  async getUserSessions(userId: string): Promise<Session[]> {
    // First get all skill matches for the user
    const { data: userMatches, error: matchError } = await supabase
      .from('skill_matches')
      .select('id')
      .or(`teacher_id.eq.${userId},learner_id.eq.${userId}`)
    
    if (matchError) {
      console.error('Error fetching user matches:', matchError)
      return []
    }
    
    if (!userMatches || userMatches.length === 0) {
      return []
    }
    
    const matchIds = userMatches.map(match => match.id)
    
    // Then get sessions for those matches
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        skill_match:skill_matches(
          *,
          teacher:users!teacher_id(*),
          learner:users!learner_id(*),
          skill:skills(*)
        )
      `)
      .in('match_id', matchIds)
      .order('scheduled_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching user sessions:', error)
      return []
    }
    return data || []
  },

  // Reviews
  async getUserReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(*),
        session:sessions(*)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user reviews:', error)
      return []
    }
    return data || []
  },

  async getUserReviewStats(userId: string): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<number, number>
  }> {
    const reviews = await this.getUserReviews(userId)
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(review => {
      distribution[review.rating]++
    })

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution: distribution
    }
  },

  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(*),
        session:sessions(*)
      `)
      .single()
    
    if (error) {
      console.error('Error creating review:', error)
      return null
    }
    return data
  },

  async getSessionReviews(sessionId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(*),
        reviewee:users!reviews_reviewee_id_fkey(*)
      `)
      .eq('session_id', sessionId)
    
    if (error) {
      console.error('Error fetching session reviews:', error)
      return []
    }
    return data || []
  },

  async hasUserReviewedSession(userId: string, sessionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('session_id', sessionId)
      .eq('reviewer_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user reviewed session:', error)
    }
    
    return !!data
  },

  // Recommendations
  async getRecommendedMatches(userId: string): Promise<RecommendedMatch[]> {
    const { data, error } = await supabase
      .rpc('get_recommended_matches', { user_id_param: userId })
    
    if (error) {
      console.error('Error fetching recommended matches:', error)
      return []
    }
    
    return data || []
  }
} 