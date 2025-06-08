import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Import components we'll create
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import SkillMatching from '@/pages/SkillMatching'
import Messages from '@/pages/Messages'
import Sessions from '@/pages/Sessions'
import Navigation from '@/components/Navigation'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {user && <Navigation />}
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <LandingPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skills" element={<SkillMatching />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/sessions" element={<Sessions />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
