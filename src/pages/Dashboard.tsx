import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp, 
  Clock,
  Star,
  Plus,
  ArrowRight,
  BookOpen,
  Target,
  Award,
  Activity,
  ChevronRight,
  Video,
  MapPin
} from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalSessions: 12,
    activeLearning: 3,
    teaching: 2,
    messagesUnread: 5,
    skillsLearned: 8,
    skillsTeaching: 4
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const quickActions = [
    {
      title: 'Find Skills to Learn',
      description: 'Browse 500+ skills and connect with expert teachers',
      icon: BookOpen,
      action: '/skills',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      title: 'Schedule a Session',
      description: 'Book time with your skill partners',
      icon: Calendar,
      action: '/sessions',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      title: 'Check Messages',
      description: 'Stay connected with your learning community',
      icon: MessageCircle,
      action: '/messages',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    }
  ]

  const recentActivity = [
    {
      type: 'session',
      title: 'JavaScript session with Alex Chen',
      description: 'Covered React hooks and state management',
      time: '2 hours ago',
      status: 'completed',
      avatar: '👨‍💻'
    },
    {
      type: 'message',
      title: 'New message from Sarah about Python',
      description: 'Discussion about data structures',
      time: '4 hours ago',
      status: 'unread',
      avatar: '👩‍🔬'
    },
    {
      type: 'match',
      title: 'New skill match: React Development',
      description: 'Found 3 potential learning partners',
      time: '1 day ago',
      status: 'pending',
      avatar: '⚛️'
    },
    {
      type: 'session',
      title: 'UI/UX Design session with Maria',
      description: 'Learned about color theory and typography',
      time: '2 days ago',
      status: 'completed',
      avatar: '🎨'
    }
  ]

  const upcomingSessions = [
    {
      title: 'Advanced TypeScript',
      teacher: 'David Kim',
      time: 'Today, 3:00 PM',
      duration: '1 hour',
      type: 'video',
      status: 'confirmed'
    },
    {
      title: 'Photography Basics',
      teacher: 'Emma Wilson',
      time: 'Tomorrow, 10:00 AM',
      duration: '1.5 hours',
      type: 'in-person',
      status: 'pending'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Here's what's happening with your skill exchanges today.
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              🔥 5 active exchanges
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalSessions}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.activeLearning}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Learning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-lg mr-3">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.teaching}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Teaching</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg mr-3">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.messagesUnread}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border-indigo-200 dark:border-indigo-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-500 rounded-lg mr-3">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.skillsLearned}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Learned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 border-rose-200 dark:border-rose-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-rose-500 rounded-lg mr-3">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{stats.skillsTeaching}</p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">Teaching</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Plus className="h-6 w-6 mr-3 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-base">
                Jump into your skill exchange activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <div
                    key={index}
                    className={`relative p-6 border-0 rounded-2xl bg-gradient-to-br ${action.bgGradient} hover:shadow-lg cursor-pointer transition-all duration-300 group`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-2xl bg-gradient-to-r ${action.gradient} shadow-lg mr-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-slate-900 dark:text-white">{action.title}</h4>
                        <p className="text-slate-600 dark:text-slate-300">{action.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Clock className="h-6 w-6 mr-3 text-green-600" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>
                Your next learning appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{session.title}</h4>
                    <Badge variant={session.status === 'confirmed' ? 'success' : 'warning'} className="text-xs">
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">with {session.teacher}</p>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-4">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.time}
                    </span>
                    <span className="flex items-center">
                      {session.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                      {session.duration}
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Sessions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Activity className="h-6 w-6 mr-3 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest skill exchange updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                  <div className="text-2xl mr-4 mt-1">{activity.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{activity.title}</h4>
                      <Badge 
                        variant={
                          activity.status === 'completed' ? 'success' : 
                          activity.status === 'unread' ? 'default' : 'warning'
                        }
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{activity.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-0 text-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to learn something amazing?</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Discover incredible skills from our community of passionate teachers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
                Browse Skills
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Share Your Skills
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 