import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Zap, 
  Users,
  Sparkles,
  Code,
  Palette,
  Music,
  Globe,
  Loader2
} from 'lucide-react'

interface DemoUser {
  id: string
  name: string
  email: string
  password: string
  role: string
  description: string
  avatar: string
  skills: string[]
  color: string
  icon: any
}

const demoUsers: DemoUser[] = [
  {
    id: 'alex',
    name: 'Alex Chen',
    email: 'alex@demo.barterly.com',
    password: 'demo123456',
    role: 'Full-Stack Developer',
    description: 'Experienced developer who loves teaching React and learning design',
    avatar: '👨‍💻',
    skills: ['React', 'Node.js', 'TypeScript', 'UI/UX Design'],
    color: 'from-blue-500 to-cyan-500',
    icon: Code
  },
  {
    id: 'sarah',
    name: 'Sarah Johnson',
    email: 'sarah@demo.barterly.com',
    password: 'demo123456',
    role: 'UX Designer',
    description: 'Creative designer passionate about user experience and learning programming',
    avatar: '👩‍🎨',
    skills: ['Figma', 'UI/UX Design', 'JavaScript', 'Photography'],
    color: 'from-purple-500 to-pink-500',
    icon: Palette
  },
  {
    id: 'marcus',
    name: 'Marcus Rodriguez',
    email: 'marcus@demo.barterly.com',
    password: 'demo123456',
    role: 'Music Teacher',
    description: 'Professional musician teaching guitar and piano, learning digital marketing',
    avatar: '🎸',
    skills: ['Guitar', 'Piano', 'Music Theory', 'Digital Marketing'],
    color: 'from-orange-500 to-red-500',
    icon: Music
  },
  {
    id: 'emma',
    name: 'Emma Wilson',
    email: 'emma@demo.barterly.com',
    password: 'demo123456',
    role: 'Language Tutor',
    description: 'Polyglot teaching Spanish and French, interested in learning web development',
    avatar: '🌍',
    skills: ['Spanish', 'French', 'Public Speaking', 'HTML/CSS'],
    color: 'from-green-500 to-emerald-500',
    icon: Globe
  },
  {
    id: 'david',
    name: 'David Kim',
    email: 'david@demo.barterly.com',
    password: 'demo123456',
    role: 'Marketing Specialist',
    description: 'Digital marketing expert teaching SEO and social media, learning photography',
    avatar: '📈',
    skills: ['SEO', 'Social Media Marketing', 'Content Marketing', 'Photography'],
    color: 'from-indigo-500 to-purple-500',
    icon: Users
  }
]

interface DemoLoginProps {
  onClose: () => void
}

export default function DemoLogin({ onClose }: DemoLoginProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleDemoLogin = async (user: DemoUser) => {
    setLoading(user.id)
    setError('')

    try {
      // Try to sign in with the demo user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (signInError) {
        // If sign in fails, try to sign up the user first
        const { error: signUpError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.name
            }
          }
        })

        if (signUpError) {
          throw signUpError
        }

        // After signup, sign in
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        })

        if (secondSignInError) {
          throw secondSignInError
        }
      }

      // Close the demo login modal
      onClose()
    } catch (error: any) {
      console.error('Demo login error:', error)
      setError(error.message || 'Failed to login as demo user')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-white rounded-2xl">
        
        {/* Header */}
        <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">Demo Login</CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  Choose a test user to explore barterly from different perspectives
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoUsers.map((user) => {
              const IconComponent = user.icon
              const isLoading = loading === user.id

              return (
                <Card 
                  key={user.id} 
                  className="group cursor-pointer transition-all duration-300 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => !loading && handleDemoLogin(user)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      
                      {/* User Header */}
                      <div className="flex items-start space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${user.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                          <span className="text-2xl">{user.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {user.name}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">{user.role}</p>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {user.description}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-700 uppercase tracking-wide">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill, index) => (
                            <Badge 
                              key={skill} 
                              variant="secondary" 
                              className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Login Button */}
                      <Button
                        disabled={!!loading}
                        className={`w-full h-10 bg-gradient-to-r ${user.color} hover:opacity-90 text-white shadow-sm transition-all duration-200`}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Logging in...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <IconComponent className="w-4 h-4 mr-2" />
                            Login as {user.name.split(' ')[0]}
                          </div>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">How to test:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Each user has different skills and perspectives</li>
                  <li>• Try creating matches between different users</li>
                  <li>• Test messaging, sessions, and skill exchanges</li>
                  <li>• Open multiple browser windows to simulate real interactions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Regular Login Option */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600 mb-3">
              Want to create your own account instead?
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-300 hover:bg-slate-50"
            >
              Use Regular Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 