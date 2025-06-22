import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageCircle, 
  Star, 
  ArrowRight, 
  Zap, 
  Search,
  CheckCircle,
  Sparkles,
  UserPlus,
  Handshake,
  BookOpen,
  Award,
  Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-7xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="w-fit px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 mx-auto">
              <Sparkles className="w-4 h-4 mr-2" />
              Simple & Effective
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                How
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> barterly</span>
                Works
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Get started in minutes with our simple 4-step process. From creating your profile 
                to completing your first skill exchange, we've made it effortless.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link to="/">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="text-lg px-8 py-6 border-2 hover:bg-slate-50 transition-all duration-200"
                >
                  <Link to="/features">
                    View Features
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Process */}
      <div className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Your Journey in 4 Simple Steps
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From signup to your first skill exchange, here's exactly how barterly works.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Step 1 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Create Your Profile</h3>
                  <p className="text-slate-600">Set up your account and showcase your skills</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Sign up with email</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Add your skills to teach</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">List skills you want to learn</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Set your availability</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">Profile Setup</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4">
                    Complete your profile in under 5 minutes and start connecting with other learners.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>5 minutes setup</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Step 2 */}
            <div className="flex justify-center lg:order-2">
              <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">Find Matches</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4">
                    Our AI-powered system finds perfect skill partners based on your needs and compatibility.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <Zap className="w-4 h-4" />
                    <span>AI-powered matching</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 lg:order-1">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Discover Matches</h3>
                  <p className="text-slate-600">Find your perfect skill exchange partners</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Browse available teachers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Filter by skills and location</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">View profiles and reviews</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Send connection requests</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Step 3 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Connect & Plan</h3>
                  <p className="text-slate-600">Start conversations and schedule sessions</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Chat with potential partners</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Discuss learning goals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Schedule your sessions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Set up meeting details</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Handshake className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">Connect & Collaborate</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4">
                    Use our messaging system to discuss details and schedule your skill exchange sessions.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>Real-time messaging</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Step 4 */}
            <div className="flex justify-center lg:order-2">
              <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">Learn & Grow</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4">
                    Complete your sessions, share feedback, and continue building your skills together.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <BookOpen className="w-4 h-4" />
                    <span>Continuous learning</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 lg:order-1">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Learn & Share</h3>
                  <p className="text-slate-600">Complete sessions and build lasting connections</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Attend scheduled sessions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Exchange knowledge and skills</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Leave reviews and feedback</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Build lasting connections</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Choose barterly?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover the unique advantages that make barterly the perfect platform for skill sharing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">Community-Driven</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  Join a community of passionate learners and teachers who believe in the power of knowledge sharing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">Fast & Efficient</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  Get started in minutes with our streamlined process and powerful matching algorithms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">Quality Assured</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  Our review system and verification process ensure high-quality learning experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h3>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already sharing skills and building meaningful connections on barterly.
          </p>
          <Button 
            size="lg" 
            asChild
            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link to="/">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 