import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  ArrowRight, 
  FileText,
  AlertTriangle
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-7xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="w-fit px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 mx-auto">
              <Shield className="w-4 h-4 mr-2" />
              Legal Information
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Terms of
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Use</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Please read these terms carefully before using barterly. By using our platform, 
                you agree to be bound by these terms and conditions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link to="/" className="flex items-center justify-center">
                    <span>Back to Home</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900">
                Terms of Use Agreement
              </CardTitle>
              <p className="text-slate-600">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-8 text-slate-700">
              {/* Introduction */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
                <p className="leading-relaxed">
                  Welcome to barterly ("we," "our," or "us"). These Terms of Use ("Terms") govern your use of our skill-sharing platform 
                  and services. By accessing or using barterly, you agree to be bound by these Terms and our Privacy Policy.
                </p>
                <p className="leading-relaxed">
                  barterly is a platform that connects individuals for skill sharing and learning purposes. We provide tools for 
                  communication, scheduling, and managing skill exchange sessions.
                </p>
              </section>

              {/* Eligibility */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">2. Eligibility</h2>
                <p className="leading-relaxed">
                  To use barterly, you must:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be at least 18 years old or have parental consent</li>
                  <li>Have the legal capacity to enter into these Terms</li>
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Maintain the security of your account credentials</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">3. User Accounts</h2>
                <p className="leading-relaxed">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account information</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and up-to-date profile information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
                <p className="leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
                </p>
              </section>

              {/* Acceptable Use */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">4. Acceptable Use</h2>
                <p className="leading-relaxed">
                  You agree to use barterly only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Share inappropriate, offensive, or harmful content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated tools to scrape or collect user data</li>
                  <li>Impersonate another person or entity</li>
                  <li>Charge fees for sessions that should be free skill exchanges</li>
                </ul>
              </section>

              {/* Skill Sharing Guidelines */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">5. Skill Sharing Guidelines</h2>
                <p className="leading-relaxed">
                  When participating in skill exchanges on barterly:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be honest about your skill levels and experience</li>
                  <li>Respect scheduled session times and commitments</li>
                  <li>Provide constructive and respectful feedback</li>
                  <li>Report any inappropriate behavior or safety concerns</li>
                  <li>Follow local laws and regulations during sessions</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Safety Notice</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        While we strive to create a safe environment, you are responsible for your own safety during skill exchange sessions. 
                        Meet in public places when possible and trust your instincts.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy and Data */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">6. Privacy and Data</h2>
                <p className="leading-relaxed">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                  which is incorporated into these Terms by reference.
                </p>
                <p className="leading-relaxed">
                  You agree that we may collect, use, and share your information as described in our Privacy Policy, 
                  including for the purpose of providing our services and improving the platform.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">7. Intellectual Property</h2>
                <p className="leading-relaxed">
                  barterly and its original content, features, and functionality are owned by us and are protected by international 
                  copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="leading-relaxed">
                  You retain ownership of content you create and share on the platform, but you grant us a license to use, 
                  display, and distribute your content in connection with our services.
                </p>
              </section>

              {/* Disclaimers */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">8. Disclaimers</h2>
                <p className="leading-relaxed">
                  barterly is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The accuracy or quality of user-provided content</li>
                  <li>The availability or uninterrupted operation of the platform</li>
                  <li>The quality of skill exchange sessions or learning outcomes</li>
                  <li>The compatibility of users or their skill levels</li>
                </ul>
              </section>

              {/* Limitation of Liability */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">9. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  To the maximum extent permitted by law, barterly shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages arising from your use of the platform.
                </p>
                <p className="leading-relaxed">
                  Our total liability to you for any claims arising from these Terms or your use of the platform shall not exceed 
                  the amount you paid us, if any, in the 12 months preceding the claim.
                </p>
              </section>

              {/* Termination */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">10. Termination</h2>
                <p className="leading-relaxed">
                  You may terminate your account at any time by contacting us. We may terminate or suspend your account 
                  immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.
                </p>
                <p className="leading-relaxed">
                  Upon termination, your right to use the platform will cease immediately, and we may delete your account data 
                  in accordance with our Privacy Policy.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">11. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by posting 
                  the new Terms on the platform and updating the "Last updated" date.
                </p>
                <p className="leading-relaxed">
                  Your continued use of barterly after any changes constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* Contact Information */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">12. Contact Information</h2>
                <p className="leading-relaxed">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700">
                    <strong>Email:</strong> legal@barterly.com<br />
                    <strong>Address:</strong> [Your Business Address]<br />
                    <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Questions About These Terms?
          </h3>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            If you have any questions or concerns about our Terms of Use, please don't hesitate to reach out to our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link to="/help" className="flex items-center justify-center">
                <span>Contact Support</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="text-lg px-8 py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Link to="/" className="flex items-center justify-center">
                <span>Back to Home</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 