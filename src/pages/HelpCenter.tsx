import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  Search, 
  ArrowRight, 
  Sparkles,
  Mail,
  MessageCircle,
  BookOpen,
  Shield,
  Users,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HelpCenter() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const faqs = [
    {
      id: 1,
      question: "How do I create an account on barterly?",
      answer: "Creating an account is simple! Click the 'Get Started' button on our homepage, enter your email and password, and you'll receive a confirmation email. Once confirmed, you can complete your profile by adding your skills and learning goals.",
      category: "Account"
    },
    {
      id: 2,
      question: "How does skill matching work?",
      answer: "Our AI-powered system analyzes your skills, learning goals, location, and availability to find the perfect skill exchange partners. You can also manually search for users with specific skills or browse through available matches.",
      category: "Matching"
    },
    {
      id: 3,
      question: "What if I can't find a good match?",
      answer: "If you're having trouble finding matches, try expanding your search criteria, adding more skills to your profile, or checking back regularly as new users join daily. You can also reach out to our support team for personalized assistance.",
      category: "Matching"
    },
    {
      id: 4,
      question: "How do I schedule a session?",
      answer: "Once you've connected with a skill partner, use our messaging system to discuss your learning goals and availability. You can then schedule sessions using our integrated calendar system, which handles timezone conversions automatically.",
      category: "Sessions"
    },
    {
      id: 5,
      question: "What happens if I need to cancel a session?",
      answer: "We understand that life happens! You can cancel or reschedule sessions up to 24 hours before the scheduled time. Please communicate with your partner as soon as possible and use our rescheduling feature to find a new time.",
      category: "Sessions"
    },
    {
      id: 6,
      question: "How do reviews and ratings work?",
      answer: "After completing a session, both participants can leave reviews and ratings (1-5 stars) for each other. This helps build trust in our community and ensures quality learning experiences. Reviews are visible on user profiles.",
      category: "Reviews"
    },
    {
      id: 7,
      question: "Is my personal information safe?",
      answer: "Absolutely! We take your privacy and security seriously. All personal information is encrypted, and we never share your data with third parties without your consent. You can control your privacy settings in your account dashboard.",
      category: "Security"
    },
    {
      id: 8,
      question: "Can I use barterly for professional networking?",
      answer: "Yes! Many users find professional opportunities through skill sharing on barterly. You can connect with professionals in your field, learn new skills for career advancement, and even find mentorship opportunities.",
      category: "Networking"
    },
    {
      id: 9,
      question: "What if I have a dispute with another user?",
      answer: "If you encounter any issues with another user, please contact our support team immediately. We have a dedicated team to handle disputes and ensure a safe, positive environment for all users.",
      category: "Support"
    },
    {
      id: 10,
      question: "How can I improve my profile to get better matches?",
      answer: "To get better matches, make sure your profile is complete with detailed skill descriptions, clear learning goals, and accurate availability. Adding photos and a bio also helps other users get to know you better.",
      category: "Profile"
    }
  ]

  const helpCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using barterly",
      icon: Sparkles,
      color: "from-blue-500 to-cyan-500",
      link: "#getting-started"
    },
    {
      title: "Account & Profile",
      description: "Manage your account and profile settings",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      link: "#account"
    },
    {
      title: "Finding Matches",
      description: "Learn how to find the perfect skill partners",
      icon: Search,
      color: "from-purple-500 to-pink-500",
      link: "#matching"
    },
    {
      title: "Sessions & Scheduling",
      description: "Schedule and manage your learning sessions",
      icon: Calendar,
      color: "from-yellow-500 to-orange-500",
      link: "#sessions"
    },
    {
      title: "Safety & Security",
      description: "Learn about our safety measures and guidelines",
      icon: Shield,
      color: "from-red-500 to-pink-500",
      link: "#safety"
    },
    {
      title: "Reviews & Feedback",
      description: "Understanding our review system",
      icon: Star,
      color: "from-indigo-500 to-purple-500",
      link: "#reviews"
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-7xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="w-fit px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 mx-auto">
              <HelpCircle className="w-4 h-4 mr-2" />
              Support Center
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                How Can We
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Help?</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Find answers to common questions, troubleshoot issues, and get the support you need 
                to make the most of your barterly experience.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for help articles, FAQs, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link to="/">
                    Back to Home
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Browse Help Topics
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find the information you need by browsing our organized help categories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <Card key={index} className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">{category.title}</CardTitle>
                  <CardDescription className="text-base text-slate-600">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find quick answers to the most common questions about using barterly.
            </p>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50/50 transition-colors duration-200"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        {faq.category}
                      </Badge>
                      <CardTitle className="text-lg text-slate-900">
                        {faq.question}
                      </CardTitle>
                    </div>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === faq.id && (
                  <CardContent className="pt-0">
                    <p className="text-slate-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredFaqs.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-600 mb-6">
                Try searching with different keywords or browse our help categories above.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="border-slate-300 hover:bg-slate-50"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-6">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">
                Still Need Help?
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Our support team is here to help you succeed
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Contact Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-200" />
                      <div>
                        <p className="text-white font-medium">Email Support</p>
                        <p className="text-blue-100 text-sm">support@barterly.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-5 h-5 text-blue-200" />
                      <div>
                        <p className="text-white font-medium">Live Chat</p>
                        <p className="text-blue-100 text-sm">Available 24/7</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-200" />
                      <div>
                        <p className="text-white font-medium">Documentation</p>
                        <p className="text-blue-100 text-sm">Complete guides and tutorials</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Response Times</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Email Support</span>
                      <Badge variant="secondary" className="bg-white/20 text-white">Within 24 hours</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Live Chat</span>
                      <Badge variant="secondary" className="bg-white/20 text-white">Instant</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Urgent Issues</span>
                      <Badge variant="secondary" className="bg-white/20 text-white">Within 4 hours</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Support Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Quick Links
          </h3>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Find more information and resources to help you get the most out of barterly.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-200"
            >
              <Link to="/how-it-works">
                How It Works
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-200"
            >
              <Link to="/features">
                Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-200"
            >
              <Link to="/terms-of-use">
                Terms of Use
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 