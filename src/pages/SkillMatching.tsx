import { useState, useEffect } from 'react'
import { supabase, db, type Skill, type UserSkill } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AddSkillForm from '@/components/AddSkillForm'
import { 
  Search, 
  Users, 
  Star, 
  Plus,
  BookOpen, 
  Grid,
  List,
  TrendingUp,
  MapPin,
  Filter,
  Sparkles,
  GraduationCap,
  UserCheck,
  Send,
  Eye,
  Target
} from 'lucide-react'

export default function SkillMatching() {
  const [user, setUser] = useState<any>(null)
  const [skills, setSkills] = useState<Record<string, Skill[]>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [potentialMatches, setPotentialMatches] = useState<UserSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [showAddSkillForm, setShowAddSkillForm] = useState(false)
  const [skillMetrics, setSkillMetrics] = useState<Record<string, {
    teacherCount: number
    learnerCount: number
    averageRating: number
  }>>({})

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadUserSkills(user.id)
      }
    }
    getUser()
    loadSkills()
  }, [])

  const loadSkills = async () => {
    const skillsByCategory = await db.getSkillsByCategory()
    setSkills(skillsByCategory)
    
    // Load metrics for all skills
    const allSkills = Object.values(skillsByCategory).flat()
    const metricsPromises = allSkills.map(skill => 
      db.getSkillMetrics(skill.id).then(metrics => ({ skillId: skill.id, metrics }))
    )
    
    const metricsResults = await Promise.all(metricsPromises)
    const metricsMap = metricsResults.reduce((acc, { skillId, metrics }) => {
      acc[skillId] = metrics
      return acc
    }, {} as Record<string, { teacherCount: number; learnerCount: number; averageRating: number }>)
    
    setSkillMetrics(metricsMap)
    setLoading(false)
  }

  const refreshData = async () => {
    await loadSkills()
    if (user) {
      await loadUserSkills(user.id)
    }
  }

  const loadUserSkills = async (userId: string) => {
    const skills = await db.getUserSkills(userId)
    setUserSkills(skills)
  }

  const findMatches = async (skillId: string) => {
    if (!user) return
    
    // Get potential matches but exclude current user
    const { data: matches, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        user:users(*)
      `)
      .eq('skill_id', skillId)
      .eq('skill_type', 'teach')
      .neq('user_id', user.id) // Exclude current user
      .order('proficiency_level', { ascending: false })

    if (!error && matches) {
      setPotentialMatches(matches)
    } else {
      setPotentialMatches([])
    }
  }



  const createMatch = async (teacherId: string, skillId: string) => {
    if (!user) return
    
    // Prevent self-matching
    if (teacherId === user.id) {
      alert('You cannot request a match with yourself!')
      return
    }
    
    try {
      // Get learner profile for proper name
      const learnerProfile = await db.getUser(user.id)
      const learnerName = learnerProfile?.full_name || user.email?.split('@')[0] || 'Someone'
      
      // Create the match request
      const match = await db.createSkillMatch({
        teacher_id: teacherId,
        learner_id: user.id,
        skill_id: skillId,
        status: 'pending',
        message: `Hi! I'd love to learn ${selectedSkill?.name} from you.`
      })
      
      if (match) {
        // Create notification for the teacher
        const notification = await db.createNotification({
          user_id: teacherId,
          type: 'match_request',
          title: 'New Learning Request',
          message: `${learnerName} wants to learn ${selectedSkill?.name} from you!`,
          data: {
            match_id: match.id,
            skill_name: selectedSkill?.name,
            learner_name: learnerName,
            learner_id: user.id
          }
        })
        
        if (notification) {
          alert('Match request sent! The teacher will be notified. 🎉')
          
          // Refresh matches to show updated status
          if (selectedSkill) {
            findMatches(selectedSkill.id)
          }
          
          // Trigger notification count refresh in navbar
          window.dispatchEvent(new CustomEvent('notificationUpdate'))
        } else {
          alert('Match created but notification failed. The teacher may not be notified.')
        }
      }
    } catch (error) {
      console.error('Error creating match:', error)
      alert('Failed to send match request. Please try again.')
    }
  }

  const filteredSkills = Object.entries(skills).reduce((acc, [category, categorySkills]) => {
    if (selectedCategory !== 'all' && category !== selectedCategory) {
      return acc
    }
    
    const filtered = categorySkills.filter(skill =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    
    return acc
  }, {} as Record<string, Skill[]>)

  const totalSkills = Object.values(skills).flat().length

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technology':
        return '💻'
      case 'languages':
        return '🌍'
      case 'arts':
        return '🎨'
      case 'business':
        return '💼'
      case 'sports':
        return '⚽'
      case 'music':
        return '🎵'
      case 'cooking':
        return '👨‍🍳'
      case 'fitness':
        return '💪'
      case 'education':
        return '📚'
      case 'health':
        return '🏥'
      default:
        return '🎯'
    }
  }

  const getProficiencyColor = (level: number) => {
    if (level >= 8) return 'bg-gradient-to-r from-green-500 to-emerald-500'
    if (level >= 6) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (level >= 4) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-slate-400 to-slate-500'
  }

  const getProficiencyLabel = (level: number) => {
    if (level >= 8) return 'Expert'
    if (level >= 6) return 'Advanced'
    if (level >= 4) return 'Intermediate'
    return 'Beginner'
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
            <h3 className="text-lg font-semibold text-slate-900">Discovering skills</h3>
            <p className="text-sm text-slate-500">Finding the perfect learning opportunities...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
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
                    Discover Skills
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">
                    Find perfect learning opportunities and expert teachers
                  </p>
                </div>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{totalSkills}</div>
                <div className="text-xs text-slate-600">Skills Available</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(skills).length}</div>
                <div className="text-xs text-slate-600">Categories</div>
              </div>
              <Button
                onClick={() => setShowAddSkillForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Skill
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-10">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search skills, categories, or expertise..."
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

                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 px-3"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Grid/List */}
        <div className="space-y-10">
          {Object.entries(filteredSkills).map(([category, categorySkills]) => (
            <div key={category} className="space-y-6">
              
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-2xl">
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 capitalize">{category}</h2>
                    <p className="text-sm text-slate-600">{categorySkills.length} skills available</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white/50">
                  {categorySkills.length} skills
                </Badge>
              </div>

              {/* Skills Grid */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {categorySkills.map((skill) => {
                  const userHasSkill = userSkills.some(us => us.skill_id === skill.id)
                  
                  return (
                    <Card 
                      key={skill.id} 
                      className={`group cursor-pointer transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] ${
                        selectedSkill?.id === skill.id ? 'ring-2 ring-blue-400 shadow-lg scale-[1.02]' : ''
                      }`}
                      onClick={() => {
                        setSelectedSkill(skill)
                        findMatches(skill.id)
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          
                          {/* Skill Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {skill.name}
                              </h3>
                              {skill.description && (
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                            {userHasSkill && (
                              <div className="flex items-center space-x-1 ml-2">
                                <UserCheck className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">Added</span>
                              </div>
                            )}
                          </div>

                          {/* Skill Metrics */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1 text-slate-600">
                                <Users className="w-4 h-4" />
                                <span>{skillMetrics[skill.id]?.teacherCount || 0} teachers</span>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-600">
                                <TrendingUp className="w-4 h-4" />
                                <span>{skillMetrics[skill.id]?.learnerCount || 0} learners</span>
                              </div>
                            </div>
                            {skillMetrics[skill.id]?.averageRating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-slate-600">{skillMetrics[skill.id]?.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 pt-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedSkill(skill)
                                findMatches(skill.id)
                              }}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Teachers ({skillMetrics[skill.id]?.teacherCount || 0})
                            </Button>
                            {!userHasSkill && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowAddSkillForm(true)
                                }}
                                className="border-slate-200 hover:bg-slate-50 px-3"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {Object.keys(filteredSkills).length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">No skills found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Try adjusting your search terms or browse different categories to discover new learning opportunities.
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
            }}>
              <Target className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}

        {/* Teachers Modal/Sidebar */}
        {selectedSkill && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedSkill.name}</h2>
                      <p className="text-sm text-slate-600">{potentialMatches.length} available teachers</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSkill(null)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>

              {/* Teachers List */}
              <div className="overflow-y-auto max-h-[70vh]">
                {potentialMatches.length > 0 ? (
                  <div className="p-6 space-y-4">
                    {potentialMatches.map((match) => (
                      <div key={match.id} className="group p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {match.user?.full_name?.[0] || match.user?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">
                                {match.user?.full_name || match.user?.email?.split('@')[0] || 'Anonymous Teacher'}
                              </h4>
                              <div className="flex items-center space-x-3 mt-1">
                                <div className={`px-2 py-1 rounded-full text-xs text-white font-medium ${getProficiencyColor(match.proficiency_level)}`}>
                                  {getProficiencyLabel(match.proficiency_level)}
                                </div>
                                {match.user?.location && (
                                  <div className="flex items-center text-xs text-slate-500">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {match.user.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => createMatch(match.user_id, selectedSkill.id)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Request Match
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No teachers found</h3>
                    <p className="text-slate-600 mb-4">
                      Be the first to add this skill and help others learn!
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedSkill(null)
                        setShowAddSkillForm(true)
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Teach This Skill
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Skill Form */}
        <AddSkillForm
          isOpen={showAddSkillForm}
          onClose={() => setShowAddSkillForm(false)}
          onSkillAdded={refreshData}
        />
      </div>
    </div>
  )
} 