import { useState, useEffect } from 'react'
import { supabase, db, type Skill, type UserSkill } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Users, 
  Star, 
  Plus,
  BookOpen,
  Filter,
  Grid,
  List,
  Zap,
  TrendingUp,
  Heart,
  ChevronRight,
  MapPin,
  Clock,
  Award
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
    setLoading(false)
  }

  const loadUserSkills = async (userId: string) => {
    const skills = await db.getUserSkills(userId)
    setUserSkills(skills)
  }

  const findMatches = async (skillId: string) => {
    if (!user) return
    const matches = await db.findPotentialMatches(user.id, skillId)
    setPotentialMatches(matches)
  }

  const addUserSkill = async (skillId: string, skillType: 'teach' | 'learn', proficiencyLevel: number) => {
    if (!user) return
    
    const userSkill = await db.addUserSkill({
      user_id: user.id,
      skill_id: skillId,
      skill_type: skillType,
      proficiency_level: proficiencyLevel
    })
    
    if (userSkill) {
      setUserSkills(prev => [...prev, userSkill])
    }
  }

  const createMatch = async (teacherId: string, skillId: string) => {
    if (!user) return
    
    const match = await db.createSkillMatch({
      teacher_id: teacherId,
      learner_id: user.id,
      skill_id: skillId,
      status: 'pending',
      message: 'Hi! I\'d love to learn this skill from you.'
    })
    
    if (match) {
      alert('Match request sent! 🎉')
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

  const categories = ['all', ...Object.keys(skills)]
  const totalSkills = Object.values(skills).flat().length
  const totalTeachers = potentialMatches.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Discover Skills 🚀
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Find the perfect learning opportunities and share your expertise
              </p>
            </div>
            <Badge variant="secondary" className="px-4 py-2 text-base">
              {totalSkills} skills available
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{totalSkills}</p>
                    <p className="text-xs text-blue-600">Total Skills</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">1,200+</p>
                    <p className="text-xs text-green-600">Teachers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{userSkills.filter(s => s.skill_type === 'learn').length}</p>
                    <p className="text-xs text-purple-600">Learning</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-orange-700">{userSkills.filter(s => s.skill_type === 'teach').length}</p>
                    <p className="text-xs text-orange-600">Teaching</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search skills, technologies, languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-input rounded-md bg-white/80 backdrop-blur-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 bg-white/80 backdrop-blur-sm"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Skills Grid/List */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Skills List */}
          <div className="lg:col-span-3">
            {Object.entries(filteredSkills).map(([category, categorySkills]) => (
              <div key={category} className="mb-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mr-3">
                    {category}
                  </h2>
                  <Badge variant="secondary" className="px-2 py-1">
                    {categorySkills.length} skills
                  </Badge>
                </div>
                
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
                  : "space-y-4"
                }>
                  {categorySkills.map((skill) => {
                    const isLearning = userSkills.some(us => us.skill_id === skill.id && us.skill_type === 'learn')
                    const isTeaching = userSkills.some(us => us.skill_id === skill.id && us.skill_type === 'teach')
                    
                    return (
                      <Card 
                        key={skill.id} 
                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md"
                        onClick={() => {
                          setSelectedSkill(skill)
                          findMatches(skill.id)
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                {skill.name}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {category} • {Math.floor(Math.random() * 50) + 10} teachers available
                              </CardDescription>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {isLearning && (
                                <Badge variant="default" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Learning
                                </Badge>
                              )}
                              {isTeaching && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Teaching
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              {!isLearning && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addUserSkill(skill.id, 'learn', 1)
                                  }}
                                  className="text-xs px-2 py-1 h-7"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Learn
                                </Button>
                              )}
                              {!isTeaching && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addUserSkill(skill.id, 'teach', 3)
                                  }}
                                  className="text-xs px-2 py-1 h-7"
                                >
                                  <Zap className="h-3 w-3 mr-1" />
                                  Teach
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

          {/* Potential Matches Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  {selectedSkill ? `${selectedSkill.name} Teachers` : 'Select a Skill'}
                </CardTitle>
                <CardDescription>
                  {potentialMatches.length > 0 
                    ? `${potentialMatches.length} teachers available`
                    : 'Choose a skill to find teachers'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {selectedSkill && potentialMatches.length > 0 ? (
                  <div className="space-y-4">
                    {potentialMatches.slice(0, 5).map((match) => (
                      <div key={match.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {match.user?.full_name || match.user?.email?.split('@')[0]}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Level {match.proficiency_level}/5
                            </p>
                          </div>
                          <div className="flex">
                            {[...Array(match.proficiency_level)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </div>
                        
                        {match.user?.location && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {match.user.location}
                          </p>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => createMatch(match.user_id, selectedSkill.id)}
                          className="w-full text-xs"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Request Match
                        </Button>
                      </div>
                    ))}
                    
                    {potentialMatches.length > 5 && (
                      <Button variant="outline" className="w-full text-sm">
                        View All {potentialMatches.length} Teachers
                      </Button>
                    )}
                  </div>
                ) : selectedSkill ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No teachers found for {selectedSkill.name}
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => addUserSkill(selectedSkill.id, 'teach', 3)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Become the first teacher!
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      Click on any skill to find teachers and potential matches
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 