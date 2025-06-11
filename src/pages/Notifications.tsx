import { useState, useEffect } from 'react'
import { supabase, db, type Notification, type SkillMatch } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Check, 
  X, 
  MessageCircle, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Trash2,
  Heart,
  Star,
  Users
} from 'lucide-react'

export default function Notifications() {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadNotifications(user.id)
      }
    }
    getUser()
  }, [])

  const loadNotifications = async (userId: string) => {
    try {
      const userNotifications = await db.getUserNotifications(userId)
      setNotifications(userNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMatchResponse = async (notificationId: string, matchId: string, response: 'accepted' | 'rejected') => {
    if (!user) return

    setResponding(notificationId)
    try {
      // Update the match status
      const updatedMatch = await db.updateSkillMatchStatus(matchId, response === 'accepted' ? 'accepted' : 'cancelled')
      
      if (updatedMatch) {
        // Mark notification as read
        await db.markNotificationAsRead(notificationId)
        
        // Create a response notification for the learner
        await db.createNotification({
          user_id: updatedMatch.learner_id,
          type: 'match_response',
          title: response === 'accepted' ? 'Match Request Accepted! 🎉' : 'Match Request Declined',
          message: response === 'accepted' 
            ? `${user.user_metadata?.full_name || user.email} accepted your request to learn ${updatedMatch.skill?.name}! You can now start messaging.`
            : `${user.user_metadata?.full_name || user.email} declined your request to learn ${updatedMatch.skill?.name}.`,
          data: {
            match_id: matchId,
            skill_name: updatedMatch.skill?.name,
            teacher_name: user.user_metadata?.full_name || user.email,
            response: response
          }
        })
        
        // Refresh notifications
        loadNotifications(user.id)
        
        alert(response === 'accepted' ? 'Match request accepted! 🎉' : 'Match request declined.')
      }
    } catch (error) {
      console.error('Error responding to match:', error)
      alert('Failed to respond to match request. Please try again.')
    } finally {
      setResponding(null)
    }
  }

  const markAsRead = async (notificationId: string) => {
    await db.markNotificationAsRead(notificationId)
    loadNotifications(user?.id)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match_request':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'match_response':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'session':
        return <Clock className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-slate-500" />
    }
  }

  const renderNotificationActions = (notification: Notification) => {
    if (notification.type === 'match_request' && notification.data?.match_id && !notification.read) {
      return (
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            onClick={() => handleMatchResponse(notification.id, notification.data.match_id, 'accepted')}
            disabled={responding === notification.id}
            className="bg-green-600 hover:bg-green-700"
          >
            {responding === notification.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMatchResponse(notification.id, notification.data.match_id, 'rejected')}
            disabled={responding === notification.id}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Decline
          </Button>
        </div>
      )
    }

    if (notification.type === 'match_response' && notification.data?.response === 'accepted') {
      return (
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            onClick={() => window.location.href = '/messages'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Start Messaging
          </Button>
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                <Bell className="h-8 w-8 mr-3 text-blue-600" />
                Notifications
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Stay updated with match requests, messages, and sessions
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-3 py-1 text-base">
                {unreadCount} unread
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Bell className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-xl font-bold text-blue-700">{notifications.length}</p>
                    <p className="text-xs text-blue-600">Total Notifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                  <div>
                    <p className="text-xl font-bold text-red-700">{unreadCount}</p>
                    <p className="text-xs text-red-600">Unread</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Heart className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="text-xl font-bold text-green-700">
                      {notifications.filter(n => n.type === 'match_request').length}
                    </p>
                    <p className="text-xs text-green-600">Match Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`shadow-lg border-0 transition-all duration-300 hover:shadow-xl ${
                  !notification.read 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                    : 'bg-white/80 dark:bg-slate-800/80'
                } backdrop-blur-sm`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                            {notification.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {notification.data && (
                            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                              {notification.data.skill_name && (
                                <span className="inline-flex items-center bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mr-2">
                                  <Star className="h-3 w-3 mr-1" />
                                  {notification.data.skill_name}
                                </span>
                              )}
                              {notification.data.learner_name && (
                                <span className="inline-flex items-center bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mr-2">
                                  <User className="h-3 w-3 mr-1" />
                                  {notification.data.learner_name}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {renderNotificationActions(notification)}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="px-2 py-1 h-auto text-xs"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No notifications yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  When you receive match requests or messages, they'll appear here.
                </p>
                <Button
                  onClick={() => window.location.href = '/skills'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Explore Skills
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 