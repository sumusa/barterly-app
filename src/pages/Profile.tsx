import { useState, useEffect } from 'react'
import { supabase, db, type User, type UserSkill, type SkillMatch } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User as UserIcon, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Clock, 
  Mail,
  Star,
  TrendingUp,
  Award,
  Users,
  Calendar,
  MessageCircle,
  Plus,
  Trash2,
  Camera,
  Globe,
  BookOpen,
  Target,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [skillMatches, setSkillMatches] = useState<SkillMatch[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    timezone: 'UTC'
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load user profile
        const profile = await db.getUser(user.id)
        setUserProfile(profile)
        
        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            bio: profile.bio || '',
            location: profile.location || '',
            timezone: profile.timezone || 'UTC'
          })
        }
        
        // Load user skills and matches
        const [skills, matches] = await Promise.all([
          db.getUserSkills(user.id),
          db.getSkillMatches(user.id)
        ])
        
        setUserSkills(skills)
        setSkillMatches(matches)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const updatedProfile = await db.updateUser(user.id, formData)
      if (updatedProfile) {
        setUserProfile(updatedProfile)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const removeSkill = async (skillId: string) => {
    const success = await db.removeUserSkill(skillId)
    if (success) {
      setUserSkills(prev => prev.filter(skill => skill.id !== skillId))
    }
  }

  const getMatchStats = () => {
    const pending = skillMatches.filter(m => m.status === 'pending').length
    const accepted = skillMatches.filter(m => m.status === 'accepted').length
    const completed = skillMatches.filter(m => m.status === 'completed').length
    const asTeacher = skillMatches.filter(m => m.teacher_id === user?.id).length
    const asLearner = skillMatches.filter(m => m.learner_id === user?.id).length
    
    return { pending, accepted, completed, asTeacher, asLearner }
  }

  const getSkillStats = () => {
    const teaching = userSkills.filter(s => s.skill_type === 'teach')
    const learning = userSkills.filter(s => s.skill_type === 'learn')
    const categories = [...new Set(userSkills.map(s => s.skill?.category).filter(Boolean))]
    
    return { teaching, learning, categories }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const matchStats = getMatchStats()
  const skillStats = getSkillStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            My Profile 👤
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Manage your barterly profile and showcase your skills
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {userProfile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                {!isEditing ? (
                  <div>
                    <CardTitle className="text-xl">
                      {userProfile?.full_name || 'Unknown User'}
                    </CardTitle>
                    <CardDescription className="flex items-center justify-center mt-2">
                      <Mail className="h-4 w-4 mr-2" />
                      {user?.email}
                    </CardDescription>
                    
                    {userProfile?.location && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center mt-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        {userProfile.location}
                      </p>
                    )}
                    
                    {userProfile?.bio && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 text-center">
                        {userProfile.bio}
                      </p>
                    )}
                    
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 w-full"
                      variant="outline"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Full Name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                    
                    <Input
                      placeholder="Location (City, Country)"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                    
                    <textarea
                      placeholder="Tell others about yourself, your interests, and what you're passionate about..."
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none h-20 text-sm"
                    />
                    
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{skillStats.teaching.length}</p>
                    <p className="text-xs text-blue-600">Teaching</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{skillStats.learning.length}</p>
                    <p className="text-xs text-green-600">Learning</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{matchStats.accepted}</p>
                    <p className="text-xs text-purple-600">Active Matches</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{matchStats.completed}</p>
                    <p className="text-xs text-orange-600">Completed</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Active in {skillStats.categories.length} categories
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Management */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Zap className="h-6 w-6 mr-3 text-blue-600" />
                    My Skills
                  </CardTitle>
                  <Button
                    onClick={() => window.location.href = '/skills'}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skills
                  </Button>
                </div>
                <CardDescription>
                  Manage the skills you're teaching and learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userSkills.length > 0 ? (
                  <div className="space-y-6">
                    {/* Teaching Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-500" />
                        Teaching ({skillStats.teaching.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {skillStats.teaching.map((skill) => (
                          <div key={skill.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {skill.skill?.name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {skill.skill?.category}
                                </p>
                                <div className="flex items-center mt-2">
                                  <span className="text-xs text-slate-500 mr-2">Level:</span>
                                  <div className="flex">
                                    {[...Array(skill.proficiency_level)].map((_, i) => (
                                      <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSkill(skill.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                        Learning ({skillStats.learning.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {skillStats.learning.map((skill) => (
                          <div key={skill.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {skill.skill?.name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {skill.skill?.category}
                                </p>
                                <div className="flex items-center mt-2">
                                  <span className="text-xs text-slate-500 mr-2">Progress:</span>
                                  <div className="flex">
                                    {[...Array(skill.proficiency_level)].map((_, i) => (
                                      <Target key={i} className="h-3 w-3 text-blue-500 fill-current" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSkill(skill.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No skills added yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Start by adding skills you can teach or want to learn
                    </p>
                    <Button
                      onClick={() => window.location.href = '/skills'}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Skills
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="h-6 w-6 mr-3 text-purple-600" />
                  Recent Matches
                </CardTitle>
                <CardDescription>
                  Your latest skill exchange connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {skillMatches.length > 0 ? (
                  <div className="space-y-4">
                    {skillMatches.slice(0, 5).map((match) => {
                      const isTeacher = match.teacher_id === user?.id
                      const partner = isTeacher ? match.learner : match.teacher
                      
                      return (
                        <div key={match.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {match.skill?.name}
                                </h4>
                                <Badge variant={
                                  match.status === 'completed' ? 'default' :
                                  match.status === 'accepted' ? 'secondary' :
                                  match.status === 'pending' ? 'outline' : 'destructive'
                                }>
                                  {match.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {isTeacher ? 'Teaching' : 'Learning from'} {' '}
                                <span className="font-medium">
                                  {partner?.full_name || partner?.email?.split('@')[0]}
                                </span>
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {new Date(match.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {match.status === 'accepted' && (
                                <Button size="sm" variant="outline">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Chat
                                </Button>
                              )}
                              {match.status === 'pending' && match.teacher_id === user?.id && (
                                <Button size="sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Accept
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    {skillMatches.length > 5 && (
                      <Button variant="outline" className="w-full">
                        View All Matches ({skillMatches.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No matches yet. Start by adding skills you want to learn!
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