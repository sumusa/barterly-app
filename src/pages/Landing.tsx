import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DemoLogin from '@/components/DemoLogin'
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Star, 
  ArrowRight, 
  Zap, 
  Globe,
  Shield,
  CheckCircle,
  Sparkles,
  TestTube,
  Github,
  Linkedin,
  Mail,
  Heart,
  Code
} from 'lucide-react'

export default function LandingPage() {
  const [isSigningUp, setIsSigningUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDemoLogin, setShowDemoLogin] = useState(false)

  const handleAuth = async (type: 'signup' | 'signin') => {
    setLoading(true)
    setMessage('')

    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const scrollToAuth = () => {
    const authSection = document.getElementById('auth-section')
    authSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Now in Beta
                </Badge>
                
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    barterly
                  </h1>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Where Skills Meet
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Purpose</span>
                </h2>
                
                <p className="text-xl text-slate-600 leading-relaxed">
                  Join a revolutionary platform where knowledge flows freely. Teach what you master, 
                  learn what you need, and build lasting connections through meaningful skill exchanges.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={scrollToAuth}
                    className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setShowDemoLogin(true)}
                    className="text-lg px-8 py-6 border-2 hover:bg-slate-50 transition-all duration-200"
                  >
                    <TestTube className="mr-2 h-5 w-5" />
                    Try Demo
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 text-slate-500 pt-4">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    <span className="text-sm font-medium">100% Secure</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-sm font-medium">Global Community</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                    <span className="text-sm font-medium">Verified Skills</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div id="auth-section" className="lg:pl-8">
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {isSigningUp ? 'Join barterly Today' : 'Welcome Back'}
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600 mt-2">
                      {isSigningUp 
                        ? 'Create your account and start sharing skills in minutes' 
                        : 'Sign in to continue your learning journey'
                      }
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>
                  
                  {message && (
                    <div className={`text-sm p-4 rounded-xl ${
                      message.includes('Check your email') 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {message}
                    </div>
                  )}

                  <Button 
                    onClick={() => handleAuth(isSigningUp ? 'signup' : 'signin')}
                    disabled={loading}
                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Loading...
                      </div>
                    ) : (
                      isSigningUp ? 'Create Account' : 'Sign In'
                    )}
                  </Button>

                  <div className="text-center pt-2 space-y-3">
                    <button
                      onClick={() => setIsSigningUp(!isSigningUp)}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
                    >
                      {isSigningUp 
                        ? 'Already have an account? Sign in' 
                        : "Don't have an account? Sign up"
                      }
                    </button>
                    
                    <div className="border-t border-slate-200 pt-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDemoLogin(true)}
                        className="w-full border-slate-300 hover:bg-slate-50"
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Try Demo Accounts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to exchange skills
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform is designed to make skill sharing effortless, engaging, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Real-time Chat</CardTitle>
                <CardDescription className="text-base text-slate-600 leading-relaxed">
                  Connect instantly with skill partners through our lightning-fast messaging system with file sharing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Smart Scheduling</CardTitle>
                <CardDescription className="text-base text-slate-600 leading-relaxed">
                  Effortlessly schedule sessions with integrated calendar, timezone handling, and automated reminders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">AI-Powered Matching</CardTitle>
                <CardDescription className="text-base text-slate-600 leading-relaxed">
                  Our intelligent system finds your perfect learning partners based on skills, goals, and compatibility
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Join Our Growing Community</h3>
            <p className="text-slate-300 text-lg">Thousands of learners are already sharing skills on barterly</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">150+</div>
              <div className="text-slate-300">Active Learners</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">80+</div>
              <div className="text-slate-300">Skills Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">200+</div>
              <div className="text-slate-300">Sessions Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">96%</div>
              <div className="text-slate-300">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Ready to Start Your Learning Journey?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already sharing skills and building meaningful connections on barterly.
          </p>
          <Button 
            size="lg" 
            onClick={scrollToAuth}
            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  barterly
                </h3>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                Where skills meet purpose. Join our community of learners and teachers sharing knowledge, building connections, and growing together.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/sumusa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com/in/sumayyahmusa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="mailto:your.email@example.com" 
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/features" className="text-slate-300 hover:text-white transition-colors duration-200">
                    Features
                  </Link>
                </li>
                <li>
                  <a href="#auth-section" className="text-slate-300 hover:text-white transition-colors duration-200">
                    Get Started
                  </a>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-slate-300 hover:text-white transition-colors duration-200">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/success-stories" className="text-slate-300 hover:text-white transition-colors duration-200">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/help" className="text-slate-300 hover:text-white transition-colors duration-200">
                    Help Center
                  </Link>
                </li>
                <li>
                  <a href="mailto:your.email@example.com" className="text-slate-300 hover:text-white transition-colors duration-200">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link to="/terms-of-use" className="text-slate-300 hover:text-white transition-colors duration-200">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-slate-400">
                <span>© 2025 barterly. All rights reserved.</span>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-400">
                <Code className="w-4 h-4" />
                <span>Built with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>by</span>
                <a 
                  href="https://github.com/sumusa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Sumayyah
                </a>
                <span>• 2025</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Login Modal */}
      {showDemoLogin && (
        <DemoLogin onClose={() => setShowDemoLogin(false)} />
      )}
    </div>
  )
} 