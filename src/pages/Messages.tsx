import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase, db, type SkillMatch, type Message } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical,
  CheckCircle,
  CheckCircle2,
  Star,
  Calendar,
  MapPin
} from 'lucide-react'

interface ConversationWithMatch extends SkillMatch {
  lastMessage?: Message
  unreadCount?: number
}

export default function Messages() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<ConversationWithMatch[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMatch | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUserAndConversations()
  }, [])

  // Set up real-time subscription for all messages to update unread counts
  useEffect(() => {
    if (!user || conversations.length === 0) return

    const conversationIds = conversations.map(conv => conv.id)
    
    const channel = supabase
      .channel('all-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message
          
          // Only handle messages for our conversations
          if (conversationIds.includes(newMessage.match_id)) {
            // If this message is for a conversation we're NOT currently viewing
            if (selectedConversation?.id !== newMessage.match_id && newMessage.sender_id !== user.id) {
              // Update the unread count for that conversation
              setConversations(prev =>
                prev.map(conv =>
                  conv.id === newMessage.match_id
                    ? { 
                        ...conv, 
                        unreadCount: (conv.unreadCount || 0) + 1,
                        lastMessage: newMessage
                      }
                    : conv
                )
              )
            }
            // If it's for the currently selected conversation, update last message
            else if (selectedConversation?.id === newMessage.match_id) {
              setConversations(prev =>
                prev.map(conv =>
                  conv.id === newMessage.match_id
                    ? { ...conv, lastMessage: newMessage }
                    : conv
                )
              )
            }
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, conversations, selectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      
      // Set up real-time subscription for messages
      const channel = supabase
        .channel(`messages:${selectedConversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${selectedConversation.id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message
            setMessages(prev => [...prev, newMessage])
            scrollToBottom()
            
            // If this is a message from another user, mark it as read immediately since we're viewing the conversation
            if (newMessage.sender_id !== user?.id) {
              supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMessage.id)
                .then(() => {
                  // Update the message in state to reflect it's been read
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === newMessage.id 
                        ? { ...msg, read_at: new Date().toISOString() }
                        : msg
                    )
                  )
                })
            }
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadUserAndConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const matches = await db.getSkillMatches(user.id)
        
        // Only show accepted matches for messaging
        const activeMatches = matches.filter(match => match.status === 'accepted')
        
        // Load last message for each conversation
        const conversationsWithMessages = await Promise.all(
          activeMatches.map(async (match) => {
            const matchMessages = await db.getMessages(match.id)
            const lastMessage = matchMessages[matchMessages.length - 1]
            const unreadCount = matchMessages.filter(
              msg => msg.sender_id !== user.id && !msg.read_at
            ).length
            
            return {
              ...match,
              lastMessage,
              unreadCount
            }
          })
        )
        
        // Sort by last message time
        conversationsWithMessages.sort((a, b) => {
          const aTime = a.lastMessage?.created_at || a.created_at
          const bTime = b.lastMessage?.created_at || b.created_at
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })
        
        setConversations(conversationsWithMessages)
        
        // Auto-select first conversation if available
        if (conversationsWithMessages.length > 0 && !selectedConversation) {
          setSelectedConversation(conversationsWithMessages[0])
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (matchId: string) => {
    try {
      const matchMessages = await db.getMessages(matchId)
      setMessages(matchMessages)
      
      // Mark messages as read
      const unreadMessages = matchMessages.filter(
        msg => msg.sender_id !== user?.id && !msg.read_at
      )
      
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(msg =>
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', msg.id)
          )
        )
        
        // Update the conversation's unread count to 0
        setConversations(prev =>
          prev.map(conv =>
            conv.id === matchId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return
    
    setSending(true)
    try {
      const message = await db.sendMessage({
        match_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: 'text'
      })
      
      if (message) {
        setMessages(prev => [...prev, message])
        setNewMessage('')
        scrollToBottom()
        
        // Update conversation's last message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { ...conv, lastMessage: message }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getPartnerInfo = (conversation: ConversationWithMatch) => {
    if (!user) return null
    
    const isTeacher = conversation.teacher_id === user.id
    return isTeacher ? conversation.learner : conversation.teacher
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const partner = getPartnerInfo(conv)
    const partnerName = partner?.full_name || partner?.email || ''
    const skillName = conv.skill?.name || ''
    
    return (
      partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skillName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    Messages
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">
                    Chat with your skill exchange partners
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{conversations.length}</div>
                <div className="text-xs text-slate-600">Conversations</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">
                  {conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)}
                </div>
                <div className="text-xs text-slate-600">Unread</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 h-[calc(100vh-200px)]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Conversations
                </CardTitle>
                
                {/* Search */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredConversations.length > 0 ? (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => {
                      const partner = getPartnerInfo(conversation)
                      const isSelected = selectedConversation?.id === conversation.id
                      
                      return (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                              : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {partner?.full_name?.[0] || partner?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <Link 
                                  to={`/profile/${partner?.id}`}
                                  className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition-colors truncate"
                                >
                                  {partner?.full_name || partner?.email?.split('@')[0] || 'Unknown'}
                                </Link>
                                {conversation.unreadCount && conversation.unreadCount > 0 && (
                                  <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                                📚 {conversation.skill?.name}
                              </p>
                              
                              {conversation.lastMessage ? (
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm truncate ${
                                    conversation.lastMessage.message_type === 'system' 
                                      ? 'text-green-600 dark:text-green-400 font-medium' 
                                      : 'text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {conversation.lastMessage.message_type === 'system' 
                                      ? `🎉 ${conversation.lastMessage.content.replace('🎉 ', '')}`
                                      : conversation.lastMessage.content
                                    }
                                  </p>
                                  <span className="text-xs text-slate-500 ml-2">
                                    {formatMessageTime(conversation.lastMessage.created_at)}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500 italic">
                                  Start your conversation
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      {searchQuery ? 'No conversations found' : 'No active conversations yet'}
                    </p>
                    {!searchQuery && (
                      <p className="text-sm text-slate-500 mt-2">
                        Accept skill matches to start chatting
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <Card className="h-full shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {getPartnerInfo(selectedConversation)?.full_name?.[0] || 
                         getPartnerInfo(selectedConversation)?.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <Link 
                          to={`/profile/${getPartnerInfo(selectedConversation)?.id}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition-colors"
                        >
                          {getPartnerInfo(selectedConversation)?.full_name || 
                           getPartnerInfo(selectedConversation)?.email?.split('@')[0] || 'Unknown'}
                        </Link>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {selectedConversation.skill?.name}
                          {getPartnerInfo(selectedConversation)?.location && (
                            <>
                              <MapPin className="h-3 w-3 ml-2 mr-1" />
                              {getPartnerInfo(selectedConversation)?.location}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link to="/sessions">
                        <Button size="sm" variant="outline" title="Schedule Session">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" title="More Options">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <div className="h-full overflow-y-auto p-4 space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message, index) => {
                        const isOwn = message.sender_id === user?.id
                        const prevMessage = messages[index - 1]
                        const showTimestamp = !prevMessage || 
                          new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000 // 5 minutes
                        
                        return (
                          <div key={message.id}>
                            {showTimestamp && (
                              <div className="text-center mb-4">
                                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                              </div>
                            )}
                            
                            {message.message_type === 'system' ? (
                              // System message - centered with special styling
                              <div className="flex justify-center">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 px-4 py-3 rounded-xl max-w-md">
                                  <p className="text-sm text-green-800 dark:text-green-200 text-center font-medium">
                                    {message.content}
                                  </p>
                                  <div className="text-center mt-1">
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                      {formatMessageTime(message.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Regular message
                              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                  isOwn 
                                    ? 'bg-blue-600 text-white rounded-br-md' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-md'
                                }`}>
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  <div className={`flex items-center justify-end mt-1 gap-1 ${
                                    isOwn ? 'text-blue-100' : 'text-slate-500'
                                  }`}>
                                    <span className="text-xs">
                                      {formatMessageTime(message.created_at)}
                                    </span>
                                    {isOwn && (
                                      message.read_at ? 
                                        <CheckCircle2 className="h-3 w-3" /> : 
                                        <CheckCircle className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Start your conversation
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Say hello and introduce yourself to {getPartnerInfo(selectedConversation)?.full_name || 'your partner'}!
                          </p>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              💡 <strong>Tip:</strong> Start by discussing your learning goals and availability for the <strong>{selectedConversation.skill?.name}</strong> skill exchange.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="resize-none min-h-[44px] text-base"
                        disabled={sending}
                      />
                    </div>
                    
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sending}
                      className="h-[44px] px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-2 text-xs text-slate-500">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-20 w-20 text-slate-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose a conversation from the sidebar to start chatting
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 