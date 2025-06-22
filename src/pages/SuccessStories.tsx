import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  ArrowRight, 
  Sparkles,
  Quote,
  TrendingUp,
  Award,
  Heart,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SuccessStories() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Software Developer",
      location: "San Francisco, CA",
      avatar: "SC",
      rating: 5,
      story: "I was struggling to learn Spanish for an upcoming trip. Through barterly, I connected with Maria who taught me conversational Spanish while I helped her improve her coding skills. We've been learning together for 6 months now and I'm confident enough to travel to Spanish-speaking countries!",
      skills: ["Spanish", "JavaScript"],
      sessions: 24,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Marcus Johnson",
      role: "Marketing Manager",
      location: "Austin, TX",
      avatar: "MJ",
      rating: 5,
      story: "As a marketing professional, I wanted to learn graphic design to create better content. I found Alex on barterly who was a designer wanting to learn marketing strategies. We've completed 15 sessions and I can now create professional graphics for my campaigns!",
      skills: ["Graphic Design", "Digital Marketing"],
      sessions: 15,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Priya Patel",
      role: "UX Designer",
      location: "New York, NY",
      avatar: "PP",
      rating: 5,
      story: "I wanted to learn photography to improve my design work. Through barterly, I met David who taught me photography fundamentals while I helped him understand UX principles. We've become great friends and even collaborated on a project together!",
      skills: ["Photography", "UX Design"],
      sessions: 18,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Carlos Rodriguez",
      role: "Chef",
      location: "Miami, FL",
      avatar: "CR",
      rating: 5,
      story: "I wanted to improve my English to better communicate with international customers. I found Emma on barterly who wanted to learn Spanish cooking. We've been exchanging skills for 8 months and I've improved my English significantly while she's mastered several Spanish dishes!",
      skills: ["English", "Spanish Cooking"],
      sessions: 32,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Emma Thompson",
      role: "Teacher",
      location: "Seattle, WA",
      avatar: "ET",
      rating: 5,
      story: "I wanted to learn yoga to reduce stress and improve my well-being. I connected with Lisa who was a yoga instructor wanting to improve her teaching skills. We've been practicing together for 4 months and I feel much more balanced and centered!",
      skills: ["Yoga", "Teaching Methods"],
      sessions: 16,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Entrepreneur",
      location: "Chicago, IL",
      avatar: "JW",
      rating: 5,
      story: "I needed to learn financial modeling for my startup. I found Rachel on barterly who was a finance professional wanting to learn about entrepreneurship. We've completed 20 sessions and I now have a solid financial model for my business!",
      skills: ["Financial Modeling", "Entrepreneurship"],
      sessions: 20,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    }
  ]

  const stats = [
    { number: "500+", label: "Success Stories", icon: Heart },
    { number: "2,000+", label: "Sessions Completed", icon: Calendar },
    { number: "150+", label: "Skills Exchanged", icon: TrendingUp },
    { number: "96%", label: "Satisfaction Rate", icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-7xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="w-fit px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 mx-auto">
              <Sparkles className="w-4 h-4 mr-2" />
              Real Stories, Real Impact
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Success
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Stories</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Discover how real people are transforming their lives through skill sharing on barterly. 
                These stories showcase the power of community-driven learning and mutual growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link to="/" className="flex items-center justify-center">
                    <span>Join the Community</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="text-lg px-8 py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Link to="/how-it-works" className="flex items-center justify-center">
                    <span>How It Works</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Story */}
      <div className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">
                Featured Success Story
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Meet Sarah and Maria - Our Community Champions
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" />
                      <AvatarFallback className="bg-white/20 text-white font-semibold">SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-white">Sarah Chen</h3>
                      <p className="text-blue-100">Software Developer</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">The Challenge</h4>
                    <p className="text-blue-100 leading-relaxed">
                      Sarah needed to learn Spanish quickly for an upcoming business trip to Mexico. 
                      Traditional language apps weren't giving her the conversational skills she needed.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-white">The Solution</h4>
                    <p className="text-blue-100 leading-relaxed">
                      She found Maria on barterly, a native Spanish speaker who wanted to improve her coding skills. 
                      They started with weekly sessions, alternating between Spanish conversation and JavaScript tutorials.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-white">The Results</h4>
                    <p className="text-blue-100 leading-relaxed">
                      After 6 months of skill sharing, Sarah is now confident speaking Spanish in professional settings, 
                      and Maria has landed a junior developer position. They've become close friends and continue learning together.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Key Achievements</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-blue-100">24 sessions completed</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-blue-100">Sarah: Fluent Spanish conversation</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-blue-100">Maria: Junior Developer position</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-blue-100">Lifelong friendship formed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Skills Exchanged</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Spanish Conversation</span>
                        <Badge variant="secondary" className="bg-white/20 text-white">Advanced</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">JavaScript Programming</span>
                        <Badge variant="secondary" className="bg-white/20 text-white">Intermediate</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Cultural Exchange</span>
                        <Badge variant="secondary" className="bg-white/20 text-white">Ongoing</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Real Stories from Our Community
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Hear from learners and teachers who have transformed their skills and built lasting connections through barterly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-900">{testimonial.name}</h3>
                        <p className="text-sm text-slate-600">{testimonial.role}</p>
                        <p className="text-xs text-slate-500">{testimonial.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-slate-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{testimonial.sessions} sessions completed</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {testimonial.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="relative">
                    <Quote className="w-6 h-6 text-slate-300 absolute -top-2 -left-1" />
                    <p className="text-slate-700 leading-relaxed pl-4">
                      "{testimonial.story}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Write Your Success Story?
          </h3>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already sharing skills and building meaningful connections on barterly.
          </p>
          <Button 
            size="lg" 
            asChild
            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link to="/" className="flex items-center justify-center">
              <span>Start Your Journey</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 