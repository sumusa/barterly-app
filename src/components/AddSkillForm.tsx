import { useState, useEffect } from 'react'
import { supabase, db } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Star,
  Sparkles,
  Target,
  Lightbulb,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface AddSkillFormProps {
  isOpen: boolean
  onClose: () => void
  onSkillAdded: () => void
  defaultSkillType?: 'teach' | 'learn'
}

const categories = [
  { value: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { value: 'Languages', icon: '🌍', color: 'from-green-500 to-emerald-500' },
  { value: 'Arts', icon: '🎨', color: 'from-purple-500 to-pink-500' },
  { value: 'Business', icon: '💼', color: 'from-slate-600 to-slate-700' },
  { value: 'Sports', icon: '⚽', color: 'from-orange-500 to-red-500' },
  { value: 'Music', icon: '🎵', color: 'from-indigo-500 to-purple-500' },
  { value: 'Cooking', icon: '👨‍🍳', color: 'from-yellow-500 to-orange-500' },
  { value: 'Fitness', icon: '💪', color: 'from-red-500 to-pink-500' },
  { value: 'Education', icon: '📚', color: 'from-blue-600 to-indigo-600' },
  { value: 'Health', icon: '🏥', color: 'from-green-600 to-teal-600' },
  { value: 'Other', icon: '🎯', color: 'from-slate-500 to-slate-600' }
]

const proficiencyLevels = [
  { value: 1, label: 'Beginner', description: 'Just starting out', color: 'bg-slate-500' },
  { value: 2, label: 'Novice', description: 'Basic understanding', color: 'bg-slate-500' },
  { value: 3, label: 'Intermediate', description: 'Some experience', color: 'bg-yellow-500' },
  { value: 4, label: 'Intermediate+', description: 'Good experience', color: 'bg-yellow-500' },
  { value: 5, label: 'Advanced', description: 'Strong skills', color: 'bg-blue-500' },
  { value: 6, label: 'Advanced+', description: 'Very strong skills', color: 'bg-blue-500' },
  { value: 7, label: 'Expert', description: 'Professional level', color: 'bg-green-500' },
  { value: 8, label: 'Expert+', description: 'Highly experienced', color: 'bg-green-500' },
  { value: 9, label: 'Master', description: 'Industry expert', color: 'bg-green-600' },
  { value: 10, label: 'Master+', description: 'World-class expert', color: 'bg-green-600' }
]

export default function AddSkillForm({ isOpen, onClose, onSkillAdded, defaultSkillType = 'learn' }: AddSkillFormProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  
  const [formData, setFormData] = useState({
    skillName: '',
    category: '',
    description: '',
    skillType: defaultSkillType,
    proficiencyLevel: defaultSkillType === 'teach' ? 7 : 3,
    isNewSkill: false
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    if (isOpen) {
      getUser()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      let skillId = ''
      
      // Check if skill already exists or create new one
      if (formData.isNewSkill) {
        const newSkill = await db.createSkill({
          name: formData.skillName,
          category: formData.category,
          description: formData.description
        })
        
        if (!newSkill) {
          throw new Error('Failed to create new skill')
        }
        skillId = newSkill.id
      } else {
        // For existing skills, we would need to find the skill ID
        // This would require a skill search/selection component
        throw new Error('Please select an existing skill or create a new one')
      }

      // Add user skill
      const userSkill = await db.addUserSkill({
        user_id: user.id,
        skill_id: skillId,
        skill_type: formData.skillType,
        proficiency_level: formData.proficiencyLevel,
        description: formData.description
      })

      if (userSkill) {
        setMessage('Skill added successfully!')
        setMessageType('success')
        setTimeout(() => {
          onSkillAdded()
          onClose()
          resetForm()
        }, 1500)
      } else {
        throw new Error('Failed to add skill to your profile')
      }
    } catch (error: any) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      skillName: '',
      category: '',
      description: '',
      skillType: defaultSkillType,
      proficiencyLevel: defaultSkillType === 'teach' ? 7 : 3,
      isNewSkill: false
    })
    setMessage('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8 shadow-2xl border-0 bg-white rounded-2xl">
        
        {/* Header */}
        <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">Add New Skill</CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  Share what you can teach or want to learn
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Skill Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">What would you like to do?</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    skillType: 'teach',
                    proficiencyLevel: prev.skillType === 'learn' ? 7 : prev.proficiencyLevel
                  }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.skillType === 'teach'
                      ? 'border-blue-400 bg-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.skillType === 'teach' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-900">Teach</div>
                      <div className="text-sm text-slate-600">Share your expertise</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    skillType: 'learn',
                    proficiencyLevel: prev.skillType === 'teach' ? 3 : prev.proficiencyLevel
                  }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.skillType === 'learn'
                      ? 'border-green-400 bg-green-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.skillType === 'learn' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-900">Learn</div>
                      <div className="text-sm text-slate-600">Discover new skills</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Skill Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Skill Name *</label>
              <Input
                type="text"
                placeholder="e.g., JavaScript, Spanish, Guitar, Cooking..."
                value={formData.skillName}
                onChange={(e) => setFormData(prev => ({ ...prev, skillName: e.target.value }))}
                className="h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                required
              />
              <p className="text-xs text-slate-500">Enter the specific skill you want to teach or learn</p>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value, isNewSkill: true }))}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.category === category.value
                        ? 'border-blue-400 bg-blue-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium text-slate-900">{category.value}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Proficiency Level */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                {formData.skillType === 'teach' ? 'Your Expertise Level' : 'Current Level'} *
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.proficiencyLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, proficiencyLevel: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex items-center justify-center">
                  <Badge 
                    className={`${proficiencyLevels[formData.proficiencyLevel - 1]?.color} text-white px-4 py-2`}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {proficiencyLevels[formData.proficiencyLevel - 1]?.label} ({formData.proficiencyLevel}/10)
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  {proficiencyLevels[formData.proficiencyLevel - 1]?.description}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description (Optional)</label>
              <textarea
                placeholder={formData.skillType === 'teach' 
                  ? "Describe your experience and what you can teach..."
                  : "Describe what you want to learn and your goals..."
                }
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-xl flex items-center space-x-3 ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.skillName || !formData.category}
                className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding Skill...
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add Skill
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6 h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 