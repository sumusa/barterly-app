import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase, db, type Skill, type UserSkill, type User, type RecommendedMatch } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AddSkillForm from '@/components/AddSkillForm'
import { 
  Search, 
  Users, 
  Star, 
  Plus,
  Grid,
  List,
  MapPin,
  Filter,
  Sparkles,
  GraduationCap,
  Send,
  Eye,
  MessageCircle,
  Zap,
  Target,
} from 'lucide-react'

interface TeacherWithSkills {
  user: User
  skills: UserSkill[]
  averageRating: number
  totalReviews: number
  totalStudents: number
}

export default function SkillMatching() {
  const [user, setUser] = useState<any>(null)
  const [skills, setSkills] = useState<Record<string, Skill[]>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [teachers, setTeachers] = useState<TeacherWithSkills[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSkillForm, setShowAddSkillForm] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithSkills | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedMatch[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Only load data after user is set
      if (user) {
        await loadSkills()
        await loadTeachers()
        await loadRecommendations()
      }
    }
    getUser()
  }, [])

  // Load recommendations when user changes
  useEffect(() => {
    if (user) {
      loadRecommendations()
    }
  }, [user])

  const loadSkills = async () => {
    const skillsByCategory = await db.getSkillsByCategory()
    setSkills(skillsByCategory)
  }

  const loadTeachers = async () => {
    try {
      // Get all teachers with their skills
      const { data: teacherSkills, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          user:users(*),
          skill:skills(*)
        `)
        .eq('skill_type', 'teach')
        .order('proficiency_level', { ascending: false })

      if (error) {
        console.error('Error loading teachers:', error)
        return
      }

      // Group teachers by user and calculate stats
      const teacherMap = new Map<string, TeacherWithSkills>()
      
      for (const teacherSkill of teacherSkills || []) {
        const userId = teacherSkill.user_id
        
        if (!teacherMap.has(userId)) {
          // Get review stats for this teacher
          const reviewStats = await db.getUserReviewStats(userId)
          
          // Get total students (completed matches)
          const { data: matches } = await supabase
            .from('skill_matches')
            .select('id')
            .eq('teacher_id', userId)
            .eq('status', 'completed')

          teacherMap.set(userId, {
            user: teacherSkill.user,
            skills: [],
            averageRating: reviewStats.averageRating,
            totalReviews: reviewStats.totalReviews,
            totalStudents: matches?.length || 0
          })
        }
        
        const teacher = teacherMap.get(userId)!
        teacher.skills.push(teacherSkill)
      }

      setTeachers(Array.from(teacherMap.values()))
      setLoading(false)
    } catch (error) {
      console.error('Error loading teachers:', error)
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    if (!user) {
      console.log('No user found, skipping recommendations')
      return
    }
    
    console.log('Loading recommendations for user:', user.id, user.email)
    setLoadingRecommendations(true)
    try {
      const recs = await db.getRecommendedMatches(user.id)
      console.log('Recommendations loaded:', recs)
      setRecommendations(recs)
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const refreshData = async () => {
    await loadSkills()
    await loadTeachers()
    if (user) {
      await loadRecommendations()
    }
  }

  const openMessageDialog = (teacher: TeacherWithSkills, skill?: Skill) => {
    setSelectedTeacher(teacher)
    setSelectedSkill(skill || teacher.skills[0]?.skill || null)
    setCustomMessage(`Hi! I'd love to learn ${skill?.name || teacher.skills[0]?.skill?.name} from you. I'm particularly interested in improving my skills and would appreciate your guidance.`)
    setShowMessageDialog(true)
  }

  const createMatch = async (teacherId: string, skillId: string, message?: string) => {
    if (!user) return

    try {
      const match = await db.createSkillMatch({
        teacher_id: teacherId,
        learner_id: user.id,
        skill_id: skillId,
        status: 'pending',
        message: message || ''
      })

      if (match) {
        toast.success('Match Request Sent! 🎉', {
          description: `Your request to learn from ${match.teacher?.full_name || 'the teacher'} has been sent. They'll respond soon!`,
          duration: 5000,
        })
        
        setShowMessageDialog(false)
        setSelectedTeacher(null)
        setSelectedSkill(null)
        setCustomMessage('')
        
        // Refresh data
        refreshData()
      }
    } catch (error) {
      console.error('Error creating match:', error)
      toast.error('Failed to send match request', {
        description: 'Please try again or contact support if the problem persists.',
        duration: 4000,
      })
    }
  }

  const handleSendRequest = () => {
    if (!selectedTeacher || !selectedSkill) return
    
    createMatch(selectedTeacher.user.id, selectedSkill.id, customMessage)
  }

  const filteredTeachers = teachers.filter(teacher => {
    // Filter by search term
    if (searchTerm) {
      const matchesName = teacher.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSkill = teacher.skills.some(skill => 
        skill.skill?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.skill?.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (!matchesName && !matchesSkill) return false
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const hasSkillInCategory = teacher.skills.some(skill => skill.skill?.category === selectedCategory)
      if (!hasSkillInCategory) return false
    }

    return true
  })

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'programming': return '💻'
      case 'design': return '🎨'
      case 'marketing': return '📈'
      case 'creative': return '🎭'
      case 'languages': return '🌍'
      case 'soft skills': return '🤝'
      case 'music': return '🎵'
      case 'lifestyle': return '🌱'
      default: return '🎯'
    }
  }

  const getProficiencyColor = (level: number) => {
    if (level === 4) return 'bg-gradient-to-r from-green-500 to-green-600'
    if (level === 3) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (level === 2) return 'bg-gradient-to-r from-yellow-500 to-orange-600'
    return 'bg-gradient-to-r from-slate-600 to-blue-600'
  }

  const getProficiencyLabel = (level: number) => {
    if (level === 4) return 'Expert'
    if (level === 3) return 'Advanced'
    if (level === 2) return 'Intermediate'
    return 'Beginner'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    if (rating >= 3.0) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-ping"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Finding amazing teachers</h3>
            <p className="text-sm text-slate-500">Discovering skilled mentors for you...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    Find Teachers
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">
                    Connect with skilled mentors and start learning
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{teachers.length}</div>
                <div className="text-xs text-slate-600">Teachers</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{Object.values(skills).flat().length}</div>
                <div className="text-xs text-slate-600">Skills</div>
              </div>
              <Button 
                onClick={() => setShowAddSkillForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your Skills
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search teachers by name, skill, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-slate-500" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {Object.keys(skills).map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-10 w-10 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        {user && (
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                <p className="text-slate-600">Teachers matched to your learning goals</p>
              </div>
            </div>
            
            {loadingRecommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.slice(0, 6).map((rec) => (
                    <Card 
                      key={`${rec.teacher_id}-${rec.skill_name}`} 
                      className="group cursor-pointer transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] border border-blue-100"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          
                          {/* Teacher Info */}
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
                              {rec.teacher_name[0]?.toUpperCase() || 'T'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 truncate">
                                {rec.teacher_name}
                              </h3>
                              <p className="text-sm text-slate-600 truncate">
                                {rec.skill_name}
                              </p>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-blue-100 text-blue-700"
                            >
                              {rec.compatibility_score} pts
                            </Badge>
                          </div>

                          {/* Match Reason */}
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-blue-500" />
                            <p className="text-sm text-slate-700 font-medium">
                              {rec.match_reason}
                            </p>
                          </div>

                          {/* Skill Details */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {getCategoryIcon(rec.skill_category)} {rec.skill_category}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs text-white ${getProficiencyColor(rec.proficiency_level)}`}
                              >
                                {getProficiencyLabel(rec.proficiency_level)}
                              </Badge>
                            </div>
                            {rec.teacher_location && (
                              <div className="flex items-center space-x-1 text-xs text-slate-500">
                                <MapPin className="w-3 h-3" />
                                <span>{rec.teacher_location}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button
                            size="sm"
                            onClick={() => {
                              // Find the teacher in the teachers list and open message dialog
                              const teacher = teachers.find(t => t.user.id === rec.teacher_id)
                              if (teacher) {
                                const skill = teacher.skills.find(s => s.skill?.name === rec.skill_name)
                                openMessageDialog(teacher, skill?.skill)
                              }
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Connect with {rec.teacher_name.split(' ')[0]}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No matching teachers found</h3>
                  <p className="text-slate-600 mb-4">
                    We couldn't find teachers for your current learning goals. Try browsing all teachers below or check back later!
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <span>💡</span>
                    <span>More teachers join every day</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* All Teachers Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">All Teachers</h2>
              <p className="text-slate-600">Browse all available teachers and skills</p>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredTeachers.map((teacher) => {
              const isCurrentUser = teacher.user.id === user?.id
              
              return (
                <Card 
                  key={teacher.user.id} 
                  className="group cursor-pointer transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02]"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      
                      {/* Teacher Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-semibold text-lg ${
                            isCurrentUser 
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-300' 
                              : 'bg-gradient-to-br from-blue-600 to-purple-600'
                          }`}>
                            {teacher.user.full_name?.[0] || teacher.user.email?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1">
                            <Link 
                              to={`/profile/${teacher.user.id}`}
                              className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {teacher.user.full_name || teacher.user.email?.split('@')[0] || 'Anonymous Teacher'}
                            </Link>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 mt-1">
                                You
                              </Badge>
                            )}
                            {teacher.user.location && (
                              <div className="flex items-center space-x-1 mt-1 text-sm text-slate-600">
                                <MapPin className="w-4 h-4" />
                                <span>{teacher.user.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating and Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {teacher.averageRating > 0 ? (
                            <>
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= Math.round(teacher.averageRating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`text-sm font-medium ${getRatingColor(teacher.averageRating)}`}>
                                {teacher.averageRating.toFixed(1)}
                              </span>
                              <span className="text-sm text-slate-500">({teacher.totalReviews})</span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">No reviews yet</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">{teacher.totalStudents}</div>
                          <div className="text-xs text-slate-500">students</div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-900">Teaching Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {teacher.skills.slice(0, 3).map((skill) => (
                            <Badge 
                              key={skill.id} 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-blue-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                openMessageDialog(teacher, skill.skill)
                              }}
                            >
                              {skill.skill?.name}
                              <div className={`ml-1 px-1.5 py-0.5 rounded-full text-xs text-white ${getProficiencyColor(skill.proficiency_level)}`}>
                                {getProficiencyLabel(skill.proficiency_level)}
                              </div>
                            </Badge>
                          ))}
                          {teacher.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{teacher.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {teacher.user.bio && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {teacher.user.bio}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-2">
                        {isCurrentUser ? (
                          <div className="text-center w-full">
                            <div className="text-sm text-blue-600 font-medium">Your Profile</div>
                            <div className="text-xs text-slate-500">Can't request from yourself</div>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openMessageDialog(teacher)}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Learn from {teacher.user.full_name?.split(' ')[0] || 'Teacher'}
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link to={`/profile/${teacher.user.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Profile</p>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No teachers found' : 'No teachers available'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Check back later or add your own skills to start teaching!'
                }
              </p>
              <Button 
                onClick={() => setShowAddSkillForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your Skills
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Skill Form */}
      <AddSkillForm
        isOpen={showAddSkillForm}
        onClose={() => setShowAddSkillForm(false)}
        onSkillAdded={refreshData}
      />

      {/* Message Dialog */}
      {showMessageDialog && selectedTeacher && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            
            {/* Dialog Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Request Learning Session</h3>
                    <p className="text-sm text-slate-600">Connect with {selectedTeacher.user.full_name || 'this teacher'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessageDialog(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-4">
              
              {/* Teacher Info */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedTeacher.user.full_name?.[0] || selectedTeacher.user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {selectedTeacher.user.full_name || selectedTeacher.user.email?.split('@')[0] || 'Teacher'}
                    </h4>
                    <p className="text-sm text-slate-600">Teaching {selectedSkill.name}</p>
                  </div>
                </div>
              </div>

              {/* Skill Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Skill to Learn
                </label>
                <select
                  value={selectedSkill.id}
                  onChange={(e) => {
                    const skill = selectedTeacher.skills.find(s => s.skill?.id === e.target.value)?.skill
                    if (skill) setSelectedSkill(skill)
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none"
                >
                  {selectedTeacher.skills.map((skill) => (
                    <option key={skill.id} value={skill.skill?.id}>
                      {skill.skill?.name} ({getProficiencyLabel(skill.proficiency_level)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Introduce yourself and explain what you'd like to learn..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="p-6 border-t border-slate-100 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowMessageDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendRequest}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 