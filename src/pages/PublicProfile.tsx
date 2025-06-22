import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, db, type User, type UserSkill, type SkillMatch } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReviewDisplay from '@/components/ReviewDisplay'
import { 
  ArrowLeft,
  MapPin, 
  Mail, 
  Calendar,
  GraduationCap,
  BookOpen,
  Star,
  Users,
  MessageCircle,
  Sparkles,
  User as UserIcon,
  Award,
  TrendingUp,
  Zap
} from 'lucide-react'

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [canMessage, setCanMessage] = useState(false)

  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    if (!userId) return
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      // Load target user profile
      const profile = await db.getUser(userId)
      setUserProfile(profile)
      
      // Load user skills
      const skills = await db.getUserSkills(userId)
      setUserSkills(skills)
      
      // Check if current user can message this user (have accepted match)
      if (user && user.id !== userId) {
        const matches = await db.getSkillMatches(user.id)
        const hasAcceptedMatch = matches.some(match => 
          (match.teacher_id === userId || match.learner_id === userId) && 
          match.status === 'accepted'
        )
        setCanMessage(hasAcceptedMatch)
      }
      
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSkillStats = () => {
    const teaching = userSkills.filter(s => s.skill_type === 'teach')
    const learning = userSkills.filter(s => s.skill_type === 'learn')
    const categories = [...new Set(userSkills.map(s => s.skill?.category).filter(Boolean))]
    
    return { teaching, learning, categories }
  }

  const getProficiencyColor = (level: number) => {
    if (level === 4) return 'bg-gradient-to-r from-green-500 to-emerald-500'
    if (level === 3) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (level === 2) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-slate-400 to-slate-500'
  }

  const getProficiencyLabel = (level: number) => {
    if (level === 4) return 'Expert'
    if (level === 3) return 'Advanced'
    if (level === 2) return 'Intermediate'
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
            <h3 className="text-lg font-semibold text-slate-900">Loading profile</h3>
            <p className="text-sm text-slate-500">Getting user information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">User not found</h3>
          <p className="text-slate-600 mb-4">The profile you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const skillStats = getSkillStats()
  const isOwnProfile = currentUser?.id === userId

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            {isOwnProfile && (
              <Link to="/profile">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    {userProfile.full_name || 'Anonymous User'}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{userProfile.email}</span>
                    </div>
                    {userProfile.location && (
                      <div className="flex items-center space-x-1 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{userProfile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{userSkills.length}</div>
                <div className="text-xs text-slate-600">Skills</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{skillStats.categories.length}</div>
                <div className="text-xs text-slate-600">Categories</div>
              </div>
              {!isOwnProfile && canMessage && (
                <Link to="/messages">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Information */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-6">
                  
                  {/* Avatar */}
                  <div className="relative mx-auto w-fit">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                      <span className="text-4xl font-bold">
                        {userProfile.full_name?.[0] || userProfile.email?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {userProfile.full_name || 'Anonymous User'}
                      </h2>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          Joined {new Date(userProfile.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {userProfile.bio && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {userProfile.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Profile Stats</h3>
                    <p className="text-sm text-slate-600">Skills and expertise overview</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{skillStats.teaching.length}</div>
                    <div className="text-xs text-slate-600">Teaching</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{skillStats.learning.length}</div>
                    <div className="text-xs text-slate-600">Learning</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Skills */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Skills & Expertise</CardTitle>
                    <CardDescription className="text-slate-600">
                      {userProfile.full_name || 'This user'}'s skills and learning interests
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Teaching Skills */}
                {skillStats.teaching.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">Teaching ({skillStats.teaching.length})</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skillStats.teaching.map((skill) => (
                        <div key={skill.id} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-900">{skill.skill?.name}</h5>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`px-2 py-1 rounded-full text-xs text-white font-medium ${getProficiencyColor(skill.proficiency_level)}`}>
                                {getProficiencyLabel(skill.proficiency_level)}
                              </div>
                              <Badge variant="secondary" className="text-xs">{skill.skill?.category}</Badge>
                            </div>
                            {skill.description && (
                              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{skill.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Skills */}
                {skillStats.learning.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">Learning ({skillStats.learning.length})</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skillStats.learning.map((skill) => (
                        <div key={skill.id} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-900">{skill.skill?.name}</h5>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`px-2 py-1 rounded-full text-xs text-white font-medium ${getProficiencyColor(skill.proficiency_level)}`}>
                                {getProficiencyLabel(skill.proficiency_level)}
                              </div>
                              <Badge variant="secondary" className="text-xs">{skill.skill?.category}</Badge>
                            </div>
                            {skill.description && (
                              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{skill.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Skills */}
                {userSkills.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No skills added yet</h3>
                    <p className="text-slate-600">
                      {userProfile.full_name || 'This user'} hasn't added any skills to their profile yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <ReviewDisplay 
              userId={userId} 
              userName={userProfile.full_name || userProfile.email?.split('@')[0] || 'This user'}
              maxReviews={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 