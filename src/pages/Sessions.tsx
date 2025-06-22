import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, db, type Session, type SkillMatch } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2,
  Users,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Bell,
  MessageCircle,
  Search,
  User,
} from 'lucide-react'

type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

interface SessionWithMatch extends Session {
  skill_match?: SkillMatch & {
    teacher?: any
    learner?: any
    skill?: any
  }
}

export default function Sessions() {
  const [user, setUser] = useState<any>(null)
  const [sessions, setSessions] = useState<SessionWithMatch[]>([])
  const [matches, setMatches] = useState<SkillMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionWithMatch | null>(null)
  const [filterStatus, setFilterStatus] = useState<SessionStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    match_id: '',
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
    meeting_url: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadUserAndSessions()
  }, [])

  const loadUserAndSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const [userSessions, userMatches] = await Promise.all([
          db.getUserSessions(user.id),
          db.getSkillMatches(user.id)
        ])
        
        setSessions(userSessions)
        setMatches(userMatches.filter(match => match.status === 'accepted'))
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async () => {
    if (!formData.match_id || !formData.title || !formData.scheduled_at) return
    
    try {
      const session = await db.createSession({
        ...formData,
        status: 'scheduled'
      })
      
      if (session) {
        await loadUserAndSessions()
        resetForm()
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const handleUpdateSession = async () => {
    if (!editingSession) return
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(formData)
        .eq('id', editingSession.id)
        .select('*')
        .single()
      
      if (!error && data) {
        await loadUserAndSessions()
        resetForm()
        setEditingSession(null)
      }
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
      
      if (!error) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const handleStatusUpdate = async (sessionId: string, status: SessionStatus) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', sessionId)
        .select('*')
        .single()
      
      if (!error) {
        await loadUserAndSessions()
      }
    } catch (error) {
      console.error('Error updating session status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      match_id: '',
      title: '',
      description: '',
      scheduled_at: '',
      duration_minutes: 60,
      location: '',
      meeting_url: ''
    })
  }

  const startEditSession = (session: SessionWithMatch) => {
    setEditingSession(session)
    setFormData({
      match_id: session.match_id,
      title: session.title,
      description: session.description || '',
      scheduled_at: session.scheduled_at.slice(0, 16), // Format for datetime-local input
      duration_minutes: session.duration_minutes,
      location: session.location || '',
      meeting_url: session.meeting_url || ''
    })
    setShowCreateForm(true)
  }

  const getPartnerInfo = (session: SessionWithMatch) => {
    if (!user || !session.skill_match) return null
    
    const isTeacher = session.skill_match.teacher_id === user.id
    return isTeacher ? session.skill_match.learner : session.skill_match.teacher
  }

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'in_progress': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'in_progress': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.skill_match?.skill?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getPartnerInfo(session)?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const upcomingSessions = sessions.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduled_at) > new Date()
  ).slice(0, 3)

  const getSessionStats = () => {
    const scheduled = sessions.filter(s => s.status === 'scheduled').length
    const completed = sessions.filter(s => s.status === 'completed').length
    const inProgress = sessions.filter(s => s.status === 'in_progress').length
    const thisWeek = sessions.filter(s => {
      const sessionDate = new Date(s.scheduled_at)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return sessionDate >= now && sessionDate <= weekFromNow
    }).length
    
    return { scheduled, completed, inProgress, thisWeek }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = getSessionStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    Sessions
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">
                    Schedule and manage your skill exchange sessions
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                <div className="text-xs text-slate-600">Scheduled</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
                <div className="text-xs text-slate-600">Completed</div>
              </div>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Upcoming Sessions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bell className="h-5 w-5 mr-2 text-orange-600" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => {
                      const partner = getPartnerInfo(session)
                      const sessionDate = new Date(session.scheduled_at)
                      
                      return (
                        <div key={session.id} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg border border-blue-200 dark:border-blue-700">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                            {session.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                            with {partner?.full_name || partner?.email?.split('@')[0]}
                          </p>
                          <div className="flex items-center text-xs text-slate-500 mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {sessionDate.toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      No upcoming sessions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Sessions List */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Users className="h-6 w-6 mr-3 text-blue-600" />
                    All Sessions
                  </CardTitle>
                  
                  <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        placeholder="Search sessions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    
                    {/* Filter */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as SessionStatus | 'all')}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {filteredSessions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSessions.map((session) => {
                      const partner = getPartnerInfo(session)
                      const sessionDate = new Date(session.scheduled_at)
                      const isUpcoming = sessionDate > new Date() && session.status === 'scheduled'
                      
                      return (
                        <div key={session.id} className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                  {session.title}
                                </h3>
                                <Badge className={`${getStatusColor(session.status)} flex items-center gap-1`}>
                                  {getStatusIcon(session.status)}
                                  {session.status}
                                </Badge>
                                {isUpcoming && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                                    Upcoming
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                  <User className="h-4 w-4 mr-2" />
                                  {partner?.full_name || partner?.email?.split('@')[0] || 'Unknown'}
                                </div>
                                
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                                  {session.skill_match?.skill?.name}
                                </div>
                                
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {sessionDate.toLocaleDateString()}
                                </div>
                                
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes}min)
                                </div>
                              </div>
                              
                              {session.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                  {session.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                {session.location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {session.location}
                                  </div>
                                )}
                                
                                {session.meeting_url && (
                                  <div className="flex items-center">
                                    <Video className="h-4 w-4 mr-1" />
                                    Online Meeting
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {session.status === 'scheduled' && isUpcoming && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusUpdate(session.id, 'in_progress')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Mark Started
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Start the session</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                  {session.meeting_url && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(session.meeting_url, '_blank')}
                                        >
                                          <Video className="h-3 w-3 mr-1" />
                                          Open Meeting
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Join video meeting</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </>
                              )}
                              
                              {session.status === 'in_progress' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(session.id, 'completed')}
                                      className="bg-purple-600 hover:bg-purple-700"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Complete
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Mark session as completed</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate('/messages')}
                                  >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Chat
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Open chat with partner</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditSession(session)}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit session details</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete session</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {searchQuery || filterStatus !== 'all' ? 'No sessions found' : 'No sessions scheduled'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {searchQuery || filterStatus !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Schedule your first skill exchange session'
                      }
                    </p>
                    {!searchQuery && filterStatus === 'all' && (
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Session
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create/Edit Session Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editingSession ? 'Edit Session' : 'Schedule New Session'}
                </CardTitle>
                <CardDescription>
                  {editingSession 
                    ? 'Update your session details'
                    : 'Set up a skill exchange session with your partner'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Match Selection */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Skill Match *
                  </label>
                  <select
                    value={formData.match_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, match_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    disabled={!!editingSession}
                  >
                    <option value="">Select a skill match...</option>
                    {matches.map((match) => {
                      const partner = match.teacher_id === user?.id ? match.learner : match.teacher
                      return (
                        <option key={match.id} value={match.id}>
                          {match.skill?.name} - with {partner?.full_name || partner?.email?.split('@')[0]}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Session Title *
                  </label>
                  <Input
                    placeholder="e.g., React Hooks Deep Dive"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Date & Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="15"
                      max="240"
                      step="15"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Location & Meeting URL */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Location
                    </label>
                    <Input
                      placeholder="Coffee shop, library, etc."
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Meeting URL
                    </label>
                    <Input
                      placeholder="Zoom, Google Meet, etc."
                      value={formData.meeting_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_url: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Description
                  </label>
                  <textarea
                    placeholder="What will you cover in this session? Any preparation needed?"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none h-20 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={editingSession ? handleUpdateSession : handleCreateSession}
                    disabled={!formData.match_id || !formData.title || !formData.scheduled_at}
                    className="flex-1"
                  >
                    {editingSession ? 'Update Session' : 'Schedule Session'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingSession(null)
                      resetForm()
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 