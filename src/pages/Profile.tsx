import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase, db, type User, type UserSkill, type SkillMatch } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AddSkillForm from '@/components/AddSkillForm'
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
  AlertCircle,
  Sparkles,
  Settings,
  Shield,
  Heart,
  Lightbulb,
  Rocket,
  GraduationCap,
  ChevronRight
} from 'lucide-react'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [skillMatches, setSkillMatches] = useState<SkillMatch[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddSkillForm, setShowAddSkillForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null)
  const [editSkillData, setEditSkillData] = useState({
    proficiency_level: 1,
    description: ''
  })
  
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
        
        toast.success('Profile Updated Successfully! 🎉', {
          description: 'Your profile information has been saved and updated.',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile', {
        description: 'Something went wrong while saving your profile. Please try again.',
        duration: 4000,
      })
    } finally {
      setSaving(false)
    }
  }

  const removeSkill = async (skillId: string) => {
    const skillToRemove = userSkills.find(s => s.id === skillId)
    const success = await db.removeUserSkill(skillId)
    if (success) {
      setUserSkills(prev => prev.filter(skill => skill.id !== skillId))
      toast.success('Skill Removed', {
        description: `${skillToRemove?.skill?.name || 'The skill'} has been removed from your profile.`,
        duration: 3000,
      })
    } else {
      toast.error('Failed to remove skill', {
        description: 'Something went wrong while removing the skill. Please try again.',
        duration: 4000,
      })
    }
  }

  const openEditSkill = (skill: UserSkill) => {
    setEditingSkill(skill)
    setEditSkillData({
      proficiency_level: skill.proficiency_level,
      description: skill.description || ''
    })
  }

  const handleEditSkill = async () => {
    if (!editingSkill) return
    
    setSaving(true)
    try {
      const updatedSkill = await db.updateUserSkill(editingSkill.id, editSkillData)
      if (updatedSkill) {
        setUserSkills(prev => prev.map(skill => 
          skill.id === editingSkill.id ? { ...skill, ...editSkillData } : skill
        ))
        setEditingSkill(null)
        setEditSkillData({ proficiency_level: 1, description: '' })
        
        toast.success('Skill Updated Successfully! ✨', {
          description: `Your ${editingSkill.skill?.name} skill has been updated with new proficiency level and description.`,
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error updating skill:', error)
      toast.error('Failed to update skill', {
        description: 'Something went wrong while updating your skill. Please try again.',
        duration: 4000,
      })
    } finally {
      setSaving(false)
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

  const getProfileCompletion = () => {
    let completion = 0
    if (userProfile?.full_name) completion += 25
    if (userProfile?.bio) completion += 25
    if (userProfile?.location) completion += 25
    if (userSkills.length > 0) completion += 25
    return completion
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
            <h3 className="text-lg font-semibold text-slate-900">Loading your profile</h3>
            <p className="text-sm text-slate-500">Getting your information ready...</p>
          </div>
        </div>
      </div>
    )
  }

  const matchStats = getMatchStats()
  const skillStats = getSkillStats()
  const profileCompletion = getProfileCompletion()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    My Profile
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">
                    Manage your profile and showcase your expertise
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="flex items-center space-x-4">
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{profileCompletion}%</div>
                <div className="text-xs text-slate-600">Complete</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{userSkills.length}</div>
                <div className="text-xs text-slate-600">Skills</div>
              </div>
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
                        {userProfile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                      <Camera className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {userProfile?.full_name || 'Complete your profile'}
                        </h2>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600">{user?.email}</span>
                        </div>
                      </div>
                      
                      {userProfile?.location && (
                        <div className="flex items-center justify-center space-x-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{userProfile.location}</span>
                        </div>
                      )}
                      
                      {userProfile?.bio && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {userProfile.bio}
                          </p>
                        </div>
                      )}
                      
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <Input
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          placeholder="Enter your full name"
                          className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Tell others about yourself..."
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="City, Country"
                          className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Progress */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Profile Strength</h3>
                    <p className="text-sm text-slate-600">Complete your profile to attract more matches</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Completion</span>
                    <span className="font-medium text-slate-900">{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className={`flex items-center space-x-2 ${userProfile?.full_name ? 'text-green-600' : 'text-slate-500'}`}>
                      {userProfile?.full_name ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>Full name</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${userProfile?.bio ? 'text-green-600' : 'text-slate-500'}`}>
                      {userProfile?.bio ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>Bio description</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${userProfile?.location ? 'text-green-600' : 'text-slate-500'}`}>
                      {userProfile?.location ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>Location</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${userSkills.length > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                      {userSkills.length > 0 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>Skills added</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Teaching</p>
                      <p className="text-2xl font-bold text-slate-900">{skillStats.teaching.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Learning</p>
                      <p className="text-2xl font-bold text-slate-900">{skillStats.learning.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Matches</p>
                      <p className="text-2xl font-bold text-slate-900">{matchStats.accepted}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Completed</p>
                      <p className="text-2xl font-bold text-slate-900">{matchStats.completed}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills Section */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">My Skills</CardTitle>
                      <CardDescription className="text-slate-600">Skills you teach and want to learn</CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowAddSkillForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skills
                  </Button>
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
                        <div key={skill.id} className="group p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center justify-between">
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
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditSkill(skill)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSkill(skill.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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
                        <div key={skill.id} className="group p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center justify-between">
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
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditSkill(skill)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSkill(skill.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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
                      <Lightbulb className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No skills added yet</h3>
                    <p className="text-slate-600 mb-4">Add your first skill to start connecting with other learners</p>
                    <Button 
                      onClick={() => setShowAddSkillForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Add Your First Skill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Recent Matches</CardTitle>
                    <CardDescription className="text-slate-600">Your latest skill connections</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {skillMatches.length > 0 ? (
                  <div className="space-y-4">
                    {skillMatches.slice(0, 5).map((match) => {
                      const partner = match.teacher_id === user?.id ? match.learner : match.teacher
                      const isTeacher = match.teacher_id === user?.id
                      
                      return (
                        <div key={match.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {partner?.full_name?.[0] || partner?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">
                                {partner?.full_name || partner?.email?.split('@')[0] || 'Unknown User'}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={isTeacher ? "default" : "secondary"} className="text-xs">
                                  {isTeacher ? 'Teaching' : 'Learning'} {match.skill?.name}
                                </Badge>
                                <Badge 
                                  variant={match.status === 'accepted' ? 'default' : match.status === 'pending' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {match.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(match.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600">No matches yet</p>
                    <p className="text-xs text-slate-500 mt-1">Start connecting with other learners</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Skill Form */}
      <AddSkillForm
        isOpen={showAddSkillForm}
        onClose={() => setShowAddSkillForm(false)}
        onSkillAdded={loadUserData}
      />

      {/* Edit Skill Dialog */}
      {editingSkill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            
            {/* Dialog Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Edit Skill</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {editingSkill.skill?.name} • {editingSkill.skill_type === 'teach' ? 'Teaching' : 'Learning'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingSkill(null)
                    setEditSkillData({ proficiency_level: 1, description: '' })
                  }}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Edit Form */}
            <div className="p-6 space-y-4">
              
              {/* Proficiency Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Proficiency Level
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editSkillData.proficiency_level}
                    onChange={(e) => setEditSkillData({
                      ...editSkillData,
                      proficiency_level: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                    <span>Expert</span>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm text-white font-medium ${getProficiencyColor(editSkillData.proficiency_level)}`}>
                      {getProficiencyLabel(editSkillData.proficiency_level)} ({editSkillData.proficiency_level}/10)
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={editSkillData.description}
                  onChange={(e) => setEditSkillData({
                    ...editSkillData,
                    description: e.target.value
                  })}
                  placeholder="Describe your experience with this skill..."
                  className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="p-6 pt-0 flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingSkill(null)
                  setEditSkillData({ proficiency_level: 1, description: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSkill}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 