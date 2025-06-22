import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase, db } from '@/lib/supabase'
import { 
  User, 
  LogOut, 
  ChevronDown,
  Home,
  Users,
  MessageCircle,
  Calendar,
  GraduationCap,
  Sparkles,
  Menu,
  X
} from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const profile = await db.getUser(user.id)
        setUserProfile(profile)
      }
    }
    
    getUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])



  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Teachers', href: '/teachers', icon: GraduationCap },
    { name: 'Matches', href: '/matches', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Sessions', href: '/sessions', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  if (!user) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                barterly
              </h1>
              <p className="text-xs text-slate-500 -mt-1">Skill Exchange</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                    active 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-1 pr-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <span className="text-sm font-semibold">
                    {userProfile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-900">
                    {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {userProfile?.location || 'Complete profile'}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 py-2 z-50">
                  
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <span className="text-lg font-bold">
                          {userProfile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {userProfile?.full_name || 'Complete your profile'}
                        </h3>
                        <p className="text-sm text-slate-600">{user?.email}</p>
                        {userProfile?.location && (
                          <p className="text-xs text-slate-500">{userProfile.location}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Profile</p>
                        <p className="text-xs text-slate-500">Manage your information</p>
                      </div>
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsDropdownOpen(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sign out</p>
                        <p className="text-xs text-red-500">See you again soon</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/50 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="font-medium">{item.name}</span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 