import { useState, useEffect } from 'react'
import { supabase, db, type Skill } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  X, 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Star,
  Sparkles,
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
  { value: 'Programming', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { value: 'Design', icon: '🎨', color: 'from-purple-500 to-pink-500' },
  { value: 'Marketing', icon: '📈', color: 'from-green-500 to-emerald-500' },
  { value: 'Creative', icon: '🎭', color: 'from-orange-500 to-red-500' },
  { value: 'Languages', icon: '🌍', color: 'from-indigo-500 to-purple-500' },
  { value: 'Soft Skills', icon: '🤝', color: 'from-slate-600 to-slate-700' },
  { value: 'Music', icon: '🎵', color: 'from-pink-500 to-rose-500' },
  { value: 'Lifestyle', icon: '🌱', color: 'from-green-600 to-teal-600' }
]

const proficiencyLevels = [
  { value: 1, label: 'Beginner', description: 'Just starting out, basic knowledge', color: 'bg-slate-500' },
  { value: 2, label: 'Intermediate', description: 'Some experience, comfortable with basics', color: 'bg-yellow-500' },
  { value: 3, label: 'Advanced', description: 'Strong skills, can teach others', color: 'bg-blue-500' },
  { value: 4, label: 'Expert', description: 'Professional level, industry expert', color: 'bg-green-500' }
]

export default function AddSkillForm({ isOpen, onClose, onSkillAdded, defaultSkillType = 'learn' }: AddSkillFormProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([])
  
  const [formData, setFormData] = useState({
    selectedSkillId: '',
    skillName: '',
    category: '',
    description: '',
    skillType: defaultSkillType,
    proficiencyLevel: defaultSkillType === 'teach' ? 3 : 1,
    isNewSkill: false
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    const loadSkills = async () => {
      const skills = await db.getSkills()
      setAllSkills(skills)
    }
    if (isOpen) {
      getUser()
      loadSkills()
    }
  }, [isOpen])

  // Filter skills when category changes
  useEffect(() => {
    if (formData.category) {
      const categorySkills = allSkills.filter(skill => skill.category === formData.category)
      setFilteredSkills(categorySkills)
    } else {
      setFilteredSkills([])
    }
  }, [formData.category, allSkills])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      let skillId = ''
      
      // Check if using existing skill or creating new one
      if (formData.selectedSkillId) {
        // Using existing skill
        skillId = formData.selectedSkillId
      } else if (formData.isNewSkill && formData.skillName && formData.category) {
        // Creating new skill
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
      selectedSkillId: '',
      skillName: '',
      category: '',
      description: '',
      skillType: defaultSkillType,
      proficiencyLevel: defaultSkillType === 'teach' ? 3 : 1,
      isNewSkill: false
    })
    setMessage('')
    setFilteredSkills([])
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
                    proficiencyLevel: prev.skillType === 'learn' ? 3 : prev.proficiencyLevel
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
                    proficiencyLevel: prev.skillType === 'teach' ? 1 : prev.proficiencyLevel
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

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      category: category.value,
                      selectedSkillId: '',
                      skillName: '',
                      isNewSkill: false
                    }))}
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

            {/* Skill Selection */}
            {formData.category && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Select Skill *</label>
                
                {/* Existing Skills Dropdown */}
                {filteredSkills.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-600">Choose from existing skills:</label>
                    <select
                      value={formData.selectedSkillId}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        selectedSkillId: e.target.value,
                        skillName: '',
                        isNewSkill: false
                      }))}
                      className="w-full h-12 px-4 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none bg-white"
                    >
                      <option value="">Select an existing skill...</option>
                      {filteredSkills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name} {skill.description && `- ${skill.description.substring(0, 50)}...`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Add New Skill Option */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="addNewSkill"
                      checked={formData.isNewSkill}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        isNewSkill: e.target.checked,
                        selectedSkillId: e.target.checked ? '' : prev.selectedSkillId
                      }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="addNewSkill" className="text-sm text-slate-700">
                      Add a new skill not in the list
                    </label>
                  </div>

                  {/* New Skill Input */}
                  {formData.isNewSkill && (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter new skill name..."
                        value={formData.skillName}
                        onChange={(e) => setFormData(prev => ({ ...prev, skillName: e.target.value }))}
                        className="h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                        required
                      />
                      <p className="text-xs text-slate-500">This skill will be added to the {formData.category} category</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                  max="4"
                  value={formData.proficiencyLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, proficiencyLevel: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex items-center justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        className={`${proficiencyLevels[formData.proficiencyLevel - 1]?.color} text-white px-4 py-2 cursor-help`}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {proficiencyLevels[formData.proficiencyLevel - 1]?.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This indicates your current skill level</p>
                    </TooltipContent>
                  </Tooltip>
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
                disabled={loading || !formData.category || (!formData.selectedSkillId && (!formData.isNewSkill || !formData.skillName))}
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