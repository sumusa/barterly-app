import { useState, useEffect } from 'react'
import { supabase, db, type User, type UserSkill, type SkillMatch, type Session, type Message } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Calendar,
  Star,
  Target,
  Zap,
  Bell,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  User as UserIcon,
  Award,
  Activity,
  MapPin,
  Video,
  Phone,
  Eye,
  Heart,
  Coffee,
  Lightbulb
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
    
    if (hour < 12) return `Good morning, ${name}! ☀️`
    if (hour < 17) return `Good afternoon, ${name}! 🌤️`
    return `Good evening, ${name}! 🌙`
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'match_request': return <Users className="h-4 w-4 text-blue-600" />
      case 'message': return <MessageCircle className="h-4 w-4 text-green-600" />
      case 'session_scheduled': return <Calendar className="h-4 w-4 text-purple-600" />
      case 'session_completed': return <CheckCircle className="h-4 w-4 text-green-600" />
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
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return time.toLocaleDateString()
  }

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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {getGreeting()}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {stats.totalSkills > 0 
              ? "Here's what's happening in your skill exchange journey"
              : "Welcome to barterly! Let's get you started with skill exchanges"
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Skills Added</p>
                  <p className="text-3xl font-bold">{stats.totalSkills}</p>
                  <p className="text-blue-100 text-xs mt-1">
                    {stats.teachingSkills} teaching • {stats.learningSkills} learning
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Matches</p>
                  <p className="text-3xl font-bold">{stats.activeMatches}</p>
                  <p className="text-green-100 text-xs mt-1">
                    {stats.pendingMatches} pending requests
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Upcoming Sessions</p>
                  <p className="text-3xl font-bold">{stats.upcomingSessions}</p>
                  <p className="text-purple-100 text-xs mt-1">
                    {stats.completedSessions} completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Messages</p>
                  <p className="text-3xl font-bold">{stats.unreadMessages}</p>
                  <p className="text-orange-100 text-xs mt-1">
                    unread messages
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            {stats.totalSkills === 0 && (
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-blue-200 dark:border-blue-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Lightbulb className="h-6 w-6 mr-3 text-blue-600" />
                    Get Started with Barterly
                  </CardTitle>
                  <CardDescription>
                    Welcome to the world of skill exchanges! Here's how to begin your journey.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => window.location.href = '/profile'}
                      className="h-20 flex-col bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      variant="outline"
                    >
                      <UserIcon className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="font-semibold">Complete Profile</span>
                      <span className="text-xs text-slate-500">Add your info & bio</span>
                    </Button>
                    
                    <Button
                      onClick={() => window.location.href = '/skills'}
                      className="h-20 flex-col bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                      variant="outline"
                    >
                      <BookOpen className="h-6 w-6 mb-2 text-green-600" />
                      <span className="font-semibold">Add Skills</span>
                      <span className="text-xs text-slate-500">What can you teach?</span>
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      How Barterly Works
                    </h4>
                    <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>1. Add skills you can teach and want to learn</li>
                      <li>2. Find matches with people who complement your skills</li>
                      <li>3. Chat and schedule skill exchange sessions</li>
                      <li>4. Learn and teach in a supportive community</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Sessions */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="h-6 w-6 mr-3 text-purple-600" />
                    Upcoming Sessions
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/sessions'}
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <CardDescription>
                  Your scheduled skill exchange sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => {
                      const sessionDate = new Date(session.scheduled_at)
                      const partner = session.skill_match?.teacher_id === user?.id 
                        ? session.skill_match?.learner 
                        : session.skill_match?.teacher
                      
                      return (
                        <div key={session.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl border border-purple-200 dark:border-purple-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                {session.title}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                with {partner?.full_name || partner?.email?.split('@')[0]}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {sessionDate.toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {session.meeting_url && (
                                  <span className="flex items-center">
                                    <Video className="h-3 w-3 mr-1" />
                                    Online
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {session.meeting_url && (
                                <Button 
                                  size="sm"
                                  onClick={() => window.open(session.meeting_url, '_blank')}
                                >
                                  <Video className="h-3 w-3 mr-1" />
                                  Join
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      No upcoming sessions scheduled
                    </p>
                    {stats.activeMatches > 0 ? (
                      <Button 
                        onClick={() => window.location.href = '/sessions'}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule a Session
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => window.location.href = '/skills'}
                        variant="outline"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Find Skill Matches
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Users className="h-6 w-6 mr-3 text-green-600" />
                    Recent Matches
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/skills'}
                  >
                    Find More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <CardDescription>
                  Your latest skill exchange connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map((match) => {
                      const isTeacher = match.teacher_id === user?.id
                      const partner = isTeacher ? match.learner : match.teacher
                      
                      return (
                        <div key={match.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {partner?.full_name?.[0] || partner?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {partner?.full_name || partner?.email?.split('@')[0]}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {match.skill?.name} • {isTeacher ? 'Teaching' : 'Learning'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              match.status === 'completed' ? 'default' :
                              match.status === 'accepted' ? 'secondary' :
                              match.status === 'pending' ? 'outline' : 'destructive'
                            }>
                              {match.status}
                            </Badge>
                            {match.status === 'accepted' && (
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Chat
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      No matches yet
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/skills'}
                      variant="outline"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Skills
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Summary */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {userProfile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <CardTitle className="text-lg">
                  {userProfile?.full_name || 'Complete your profile'}
                </CardTitle>
                <CardDescription>
                  {userProfile?.location && (
                    <span className="flex items-center justify-center text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {userProfile.location}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {userProfile?.bio ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {userProfile.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic mb-4">
                    Add a bio to tell others about yourself
                  </p>
                )}
                <Button 
                  onClick={() => window.location.href = '/profile'}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {activity.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No recent activity
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/skills'}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Skills
                </Button>
                <Button 
                  onClick={() => window.location.href = '/messages'}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={stats.activeMatches === 0}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages {stats.unreadMessages > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {stats.unreadMessages}
                    </Badge>
                  )}
                </Button>
                <Button 
                  onClick={() => window.location.href = '/sessions'}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 