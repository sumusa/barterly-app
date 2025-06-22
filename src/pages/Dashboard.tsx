import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, db, type User, type SkillMatch, type Session } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  User as UserIcon,
  Activity,
  Video,
  Eye,
  Lightbulb,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

interface DashboardStats {
  totalSkills: number
  teachingSkills: number
  learningSkills: number
  activeMatches: number
  pendingMatches: number
  completedMatches: number
  unreadMessages: number
  upcomingSessions: number
  completedSessions: number
}

interface RecentActivity {
  id: string
  type: 'match_request' | 'message' | 'session_scheduled' | 'session_completed' | 'skill_added'
  title: string
  description: string
  timestamp: string
  avatar?: string
  skill?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalSkills: 0,
    teachingSkills: 0,
    learningSkills: 0,
    activeMatches: 0,
    pendingMatches: 0,
    completedMatches: 0,
    unreadMessages: 0,
    upcomingSessions: 0,
    completedSessions: 0
  })
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [recentMatches, setRecentMatches] = useState<SkillMatch[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        setLoading(false)
        return
      }

      // Load user profile
      const profile = await db.getUser(user.id)
      setUserProfile(profile)

      // Load all user data in parallel
      const [userSkills, skillMatches, userSessions] = await Promise.all([
        db.getUserSkills(user.id),
        db.getSkillMatches(user.id),
        db.getUserSessions(user.id)
      ])

      // Calculate stats
      const teachingSkills = userSkills.filter(s => s.skill_type === 'teach')
      const learningSkills = userSkills.filter(s => s.skill_type === 'learn')
      const activeMatches = skillMatches.filter(m => m.status === 'accepted')
      const pendingMatches = skillMatches.filter(m => m.status === 'pending')
      const completedMatches = skillMatches.filter(m => m.status === 'completed')
      const now = new Date()
      const upcoming = userSessions.filter(s => 
        s.status === 'scheduled' && new Date(s.scheduled_at) > now
      )
      const completed = userSessions.filter(s => s.status === 'completed')

      // Load messages for unread count
      let unreadCount = 0
      for (const match of activeMatches) {
        const messages = await db.getMessages(match.id)
        unreadCount += messages.filter(
          msg => msg.sender_id !== user.id && !msg.read_at
        ).length
      }

      setStats({
        totalSkills: userSkills.length,
        teachingSkills: teachingSkills.length,
        learningSkills: learningSkills.length,
        activeMatches: activeMatches.length,
        pendingMatches: pendingMatches.length,
        completedMatches: completedMatches.length,
        unreadMessages: unreadCount,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length
      })

      // Set upcoming sessions (limit to next 3)
      setUpcomingSessions(upcoming.slice(0, 3))
      
      // Set recent matches (limit to 5)
      setRecentMatches(skillMatches.slice(0, 5))

      // Generate recent activity
      const activities: RecentActivity[] = []
      
      // Add recent matches
      skillMatches.slice(0, 3).forEach(match => {
        const partner = match.teacher_id === user.id ? match.learner : match.teacher
        activities.push({
          id: `match-${match.id}`,
          type: 'match_request',
          title: match.status === 'pending' ? 'New Match Request' : 'Match Accepted',
          description: `${match.skill?.name} with ${partner?.full_name || partner?.email?.split('@')[0]}`,
          timestamp: match.created_at,
          skill: match.skill?.name
        })
      })

      // Add recent sessions
      userSessions.slice(0, 2).forEach(session => {
        activities.push({
          id: `session-${session.id}`,
          type: session.status === 'completed' ? 'session_completed' : 'session_scheduled',
          title: session.status === 'completed' ? 'Session Completed' : 'Session Scheduled',
          description: session.title,
          timestamp: session.status === 'completed' ? session.updated_at : session.created_at,
          skill: session.skill_match?.skill?.name
        })
      })

      // Sort activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 6))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
    
    if (hour < 12) return `Good morning, ${name}`
    if (hour < 17) return `Good afternoon, ${name}`
    return `Good evening, ${name}`
  }

  const getGreetingEmoji = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '☀️'
    if (hour < 17) return '🌤️'
    return '🌙'
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'match_request': return <Users className="h-4 w-4 text-blue-600" />
      case 'message': return <MessageCircle className="h-4 w-4 text-green-600" />
      case 'session_scheduled': return <Calendar className="h-4 w-4 text-purple-600" />
      case 'session_completed': return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'skill_added': return <BookOpen className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4 text-slate-600" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)}d ago`
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
            <h3 className="text-lg font-semibold text-slate-900">Loading your dashboard</h3>
            <p className="text-sm text-slate-500">Gathering your latest activity and insights...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{getGreetingEmoji()}</span>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                      {getGreeting()}
                    </h1>
                    <p className="text-lg text-slate-600 mt-1">
                      Ready to learn something new today?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => navigate('/skills')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Find Skills
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/sessions')}
                className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Skills Overview */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Total Skills</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalSkills}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      {stats.teachingSkills} teaching
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                      {stats.learningSkills} learning
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Matches */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Active Matches</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.activeMatches}</p>
                  {stats.pendingMatches > 0 && (
                    <p className="text-xs text-amber-600 font-medium">
                      {stats.pendingMatches} pending requests
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Messages</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.unreadMessages}</p>
                  <p className="text-xs text-slate-500">unread messages</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Sessions</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.upcomingSessions}</p>
                  <p className="text-xs text-slate-500">upcoming sessions</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Sessions */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">Upcoming Sessions</CardTitle>
                      <CardDescription className="text-slate-600">Your scheduled learning sessions</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/sessions')}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="group p-4 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {session.title}
                            </h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-slate-600 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(session.scheduled_at).toLocaleDateString()}
                              </span>
                              {session.skill_match?.skill && (
                                <Badge variant="secondary" className="text-xs">
                                  {session.skill_match.skill.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No upcoming sessions</h3>
                    <p className="text-slate-600 mb-4">Schedule your first learning session to get started</p>
                    <Button onClick={() => navigate('/sessions')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">Recent Matches</CardTitle>
                      <CardDescription className="text-slate-600">Your latest skill connections</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/matches')}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMatches.length > 0 ? (
                  recentMatches.map((match) => {
                    const partner = match.teacher_id === user?.id ? match.learner : match.teacher
                    const isTeacher = match.teacher_id === user?.id
                    
                    return (
                      <div key={match.id} className="group p-4 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {partner?.full_name?.[0] || partner?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {partner?.full_name || partner?.email?.split('@')[0] || 'Unknown User'}
                              </h4>
                              <div className="flex items-center space-x-3 mt-1">
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
                          <div className="flex items-center space-x-2">
                            {match.status === 'accepted' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => navigate('/messages')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                            )}
                            {match.status === 'pending' && match.teacher_id === user?.id && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => navigate('/matches')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 border-amber-200 hover:bg-amber-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Respond
                              </Button>
                            )}
                            {match.status === 'pending' && match.learner_id === user?.id && (
                              <Badge variant="secondary" className="text-xs text-amber-600 bg-amber-50">
                                Waiting for response
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No matches yet</h3>
                    <p className="text-slate-600 mb-4">Start connecting with teachers and learners</p>
                    <Button onClick={() => navigate('/skills')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Explore Skills
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Profile Completion */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Profile</h3>
                    <p className="text-sm text-slate-600">Complete your profile</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Completion</span>
                    <span className="font-medium text-slate-900">
                      {userProfile?.bio && userProfile?.location ? '100%' : userProfile?.bio || userProfile?.location ? '75%' : '50%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: userProfile?.bio && userProfile?.location ? '100%' : userProfile?.bio || userProfile?.location ? '75%' : '50%' 
                      }}
                    ></div>
                  </div>
                  
                  {(!userProfile?.bio || !userProfile?.location) && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/profile')}
                      className="w-full mt-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Complete Profile
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Recent Activity</CardTitle>
                    <CardDescription className="text-slate-600">Your latest updates</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600">No recent activity</p>
                    <p className="text-xs text-slate-500 mt-1">Start learning to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Quick Tip</h3>
                    <p className="text-sm text-slate-600">Maximize your learning</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {stats.totalSkills === 0 
                      ? "Add your first skill to get started! Whether you're teaching or learning, skills are the foundation of great connections."
                      : stats.activeMatches === 0
                      ? "Ready to connect? Browse skills and send match requests to start learning from experienced teachers."
                      : "Keep the momentum going! Schedule regular sessions and engage with your learning partners for the best results."
                    }
                  </p>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(stats.totalSkills === 0 ? '/profile' : '/skills')}
                    className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    {stats.totalSkills === 0 ? 'Add Skills' : stats.activeMatches === 0 ? 'Find Teachers' : 'Schedule Session'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 