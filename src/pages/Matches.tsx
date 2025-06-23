import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase, db, type SkillMatch, type User, type Session } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ReviewForm from '@/components/ReviewForm'
import { 
  Search,
  Filter,
  Users,
  MessageCircle,
  Calendar,
  CheckCircle,
  Clock,
  X,
  Eye,
  Sparkles,
  GraduationCap,
  BookOpen,
  Star,
  MapPin,
  AlertCircle
} from 'lucide-react'

type MatchFilter = 'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'

export default function Matches() {
  const [user, setUser] = useState<any>(null)
  const [matches, setMatches] = useState<SkillMatch[]>([])
  const [filteredMatches, setFilteredMatches] = useState<SkillMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>('all')
  const [responding, setResponding] = useState<string | null>(null)
  const [completedSessions, setCompletedSessions] = useState<Session[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [selectedReviewee, setSelectedReviewee] = useState<User | null>(null)

  useEffect(() => {
    loadUserAndMatches()
  }, [])

  useEffect(() => {
    filterMatches()
  }, [matches, searchTerm, selectedFilter])

  const loadUserAndMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const userMatches = await db.getSkillMatches(user.id)
        setMatches(userMatches)
        
        // Load completed sessions for review prompts
        const sessions = await db.getUserSessions(user.id)
        const completed = sessions.filter(s => s.status === 'completed')
        setCompletedSessions(completed)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMatches = () => {
    let filtered = matches

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(match => match.status === selectedFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(match => {
        const partner = match.teacher_id === user?.id ? match.learner : match.teacher
        const partnerName = partner?.full_name || partner?.email || ''
        const skillName = match.skill?.name || ''
        
        return (
          partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skillName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    setFilteredMatches(filtered)
  }

  const handleMatchResponse = async (matchId: string, response: 'accepted' | 'cancelled') => {
    if (!user) return

    setResponding(matchId)
    try {
      const updatedMatch = await db.updateSkillMatchStatus(matchId, response)
      
      if (updatedMatch) {
        // Get teacher profile for proper name
        const teacherProfile = await db.getUser(user.id)
        const teacherName = teacherProfile?.full_name || user.email?.split('@')[0] || 'Teacher'
        
        // If accepted, create initial conversation messages
        if (response === 'accepted') {
          // Create the original request message first (with earlier timestamp)
          if (updatedMatch.message) {
            await db.sendMessage({
              match_id: matchId,
              sender_id: updatedMatch.learner_id,
              content: updatedMatch.message,
              message_type: 'text'
            })
          }
          
          // Small delay to ensure proper ordering
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Create system message announcing the match
          await db.sendMessage({
            match_id: matchId,
            sender_id: user.id,
            content: `🎉 ${teacherName} accepted your request to learn ${updatedMatch.skill?.name}! You can now start messaging.`,
            message_type: 'system'
          })
        }
        
        // Refresh matches
        loadUserAndMatches()
        
        // Show success toast
        if (response === 'accepted') {
          toast.success('Match Request Accepted! 🎉', {
            description: `You can now start messaging with ${updatedMatch.learner?.full_name || 'the learner'} about ${updatedMatch.skill?.name}`,
            duration: 5000,
          })
        } else {
          toast.info('Match Request Declined', {
            description: `You declined the request to teach ${updatedMatch.skill?.name}`,
            duration: 4000,
          })
        }
      }
    } catch (error) {
      console.error('Error responding to match:', error)
      toast.error('Failed to respond to match request', {
        description: 'Please try again or contact support if the problem persists.',
        duration: 4000,
      })
    } finally {
      setResponding(null)
    }
  }

  const getMatchStats = () => {
    const pending = matches.filter(m => m.status === 'pending').length
    const accepted = matches.filter(m => m.status === 'accepted').length
    const completed = matches.filter(m => m.status === 'completed').length
    const asTeacher = matches.filter(m => m.teacher_id === user?.id).length
    const asLearner = matches.filter(m => m.learner_id === user?.id).length
    
    return { pending, accepted, completed, asTeacher, asLearner }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <Star className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
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
            <h3 className="text-lg font-semibold text-slate-900">Loading matches</h3>
            <p className="text-sm text-slate-500">Getting your connections...</p>
          </div>
        </div>
      </div>
    )
  }

  const matchStats = getMatchStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    My Matches
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">
                    Manage your skill exchange connections
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/skills">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Find New Matches
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{matches.length}</div>
              <div className="text-xs text-slate-600">Total Matches</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{matchStats.pending}</div>
              <div className="text-xs text-yellow-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{matchStats.accepted}</div>
              <div className="text-xs text-green-600">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{matchStats.asTeacher}</div>
              <div className="text-xs text-blue-600">Teaching</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{matchStats.asLearner}</div>
              <div className="text-xs text-purple-600">Learning</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search matches by name or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-slate-500" />
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as MatchFilter)}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none bg-white"
                >
                  <option value="all">All Matches</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const partner = match.teacher_id === user?.id ? match.learner : match.teacher
              const isTeacher = match.teacher_id === user?.id
              const isPending = match.status === 'pending'
              const canRespond = isPending && isTeacher
              
              return (
                <Card key={match.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      
                      {/* Match Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {partner?.full_name?.[0] || partner?.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <Link 
                              to={`/profile/${partner?.id}`}
                              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {partner?.full_name || partner?.email?.split('@')[0] || 'Unknown User'}
                            </Link>
                            <Badge className={`text-xs border ${getStatusColor(match.status)}`}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(match.status)}
                                <span className="capitalize">{match.status}</span>
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              {isTeacher ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                              <span>{isTeacher ? 'Teaching' : 'Learning'} {match.skill?.name}</span>
                            </div>
                            {partner?.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{partner.location}</span>
                              </div>
                            )}
                            <div className="text-xs text-slate-500">
                              {new Date(match.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {match.message && (
                            <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm text-slate-700 italic">"{match.message}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {canRespond ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleMatchResponse(match.id, 'accepted')}
                              disabled={responding === match.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {responding === match.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMatchResponse(match.id, 'cancelled')}
                              disabled={responding === match.id}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        ) : match.status === 'accepted' ? (
                          <div className="flex items-center space-x-2">
                            <Link to="/messages">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                            </Link>
                            <Link to="/sessions">
                              <Button size="sm" variant="outline">
                                <Calendar className="h-4 w-4 mr-1" />
                                Schedule
                              </Button>
                            </Link>
                          </div>
                        ) : match.status === 'completed' ? (
                          <div className="flex items-center space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link to={`/profile/${partner?.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Profile
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View user's full profile</p>
                              </TooltipContent>
                            </Tooltip>
                            {/* Review Prompt for Completed Sessions */}
                            {(() => {
                              const session = completedSessions.find(s => s.skill_match?.id === match.id)
                              if (session) {
                                return (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSession(session)
                                      setSelectedReviewee(partner || null)
                                      setShowReviewForm(true)
                                    }}
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                )
                              }
                              return null
                            })()}
                          </div>
                        ) : isPending && !isTeacher ? (
                          <Badge variant="secondary" className="text-xs">
                            Waiting for response
                          </Badge>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link to={`/profile/${partner?.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Profile
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View user's full profile</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || selectedFilter !== 'all' ? 'No matches found' : 'No matches yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by exploring skills and connecting with other learners and teachers.'
                }
              </p>
              <Link to="/skills">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Discover Skills
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && selectedSession && selectedReviewee && (
        <ReviewForm
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          sessionId={selectedSession?.id || ''}
          sessionTitle={selectedSession?.title || ''}
          revieweeId={selectedReviewee?.id || ''}
          revieweeName={selectedReviewee?.full_name || selectedReviewee?.email?.split('@')[0] || 'Unknown'}
          sessionDate={selectedSession?.scheduled_at || ''}
          sessionDuration={selectedSession?.duration_minutes || 60}
          onReviewSubmitted={() => {
            setShowReviewForm(false)
            setSelectedSession(null)
            setSelectedReviewee(null)
          }}
        />
      )}
    </div>
  )
} 