# 🧪 Barterly Demo & Testing Guide

Welcome to the barterly demo system! This guide will help you test the app from different user perspectives using our pre-configured demo accounts.

## 🚀 Quick Start

### Option 1: Demo Login (Recommended)
1. Visit the barterly landing page
2. Click **"Try Demo"** button or **"Try Demo Accounts"** in the login form
3. Choose any demo user to instantly login and explore

### Option 2: Manual Login
Use these credentials to login manually:
- **Email**: `alex@demo.barterly.com` | **Password**: `demo123456`
- **Email**: `sarah@demo.barterly.com` | **Password**: `demo123456`
- **Email**: `marcus@demo.barterly.com` | **Password**: `demo123456`
- **Email**: `emma@demo.barterly.com` | **Password**: `demo123456`
- **Email**: `david@demo.barterly.com` | **Password**: `demo123456`

## 👥 Demo User Profiles

### 🧑‍💻 Alex Chen - Full-Stack Developer
- **Location**: San Francisco, CA
- **Teaching**: React (Expert), Node.js (Advanced), TypeScript (Advanced)
- **Learning**: UI/UX Design (Intermediate)
- **Perfect for testing**: Developer perspective, teaching technical skills

### 👩‍🎨 Sarah Johnson - UX Designer  
- **Location**: New York, NY
- **Teaching**: Figma (Expert), UI/UX Design (Expert), Photography (Advanced)
- **Learning**: JavaScript (Beginner)
- **Perfect for testing**: Designer perspective, creative skills

### 🎸 Marcus Rodriguez - Music Teacher
- **Location**: Austin, TX
- **Teaching**: Guitar (Expert), Piano (Advanced), Music Theory (Expert)
- **Learning**: Digital Marketing (Beginner)
- **Perfect for testing**: Creative educator perspective, non-tech skills

### 🌍 Emma Wilson - Language Tutor
- **Location**: Miami, FL
- **Teaching**: Spanish (Expert), French (Advanced), Public Speaking (Advanced)
- **Learning**: HTML/CSS (Beginner)
- **Perfect for testing**: Language education, beginner learner perspective

### 📈 David Kim - Marketing Specialist
- **Location**: Seattle, WA
- **Teaching**: SEO (Advanced), Social Media Marketing (Expert), Content Marketing (Advanced)
- **Learning**: Photography (Intermediate)
- **Perfect for testing**: Business/marketing perspective, skill exchange

## 🧪 Testing Scenarios

### 1. **Skill Discovery & Matching**
- Login as **Emma** (wants to learn HTML/CSS)
- Browse skills → Find **Alex** (teaches programming)
- Send a match request with a personalized message
- Switch to **Alex** account to accept the match

### 2. **Cross-Skill Exchange**
- Login as **Sarah** (teaches design, wants to learn JavaScript)
- Find **Alex** (teaches programming, wants to learn design)
- Create a mutual skill exchange match
- Test the bidirectional learning relationship

### 3. **Creative Skills Testing**
- Login as **Marcus** (music teacher)
- Browse creative skills and find **Sarah** (photography)
- Test non-technical skill matching and communication

### 4. **Multi-User Conversations**
- Open multiple browser windows/tabs
- Login as different users in each window
- Test real-time messaging between users
- Verify message read status and notifications

### 5. **Session Scheduling**
- As matched users, schedule a learning session
- Test calendar integration and timezone handling
- Try different session types (in-person, online, etc.)

### 6. **Profile Management**
- Test editing profiles with different user types
- Add/remove skills with varying proficiency levels
- Update bio, location, and preferences

## 🔄 Multi-User Testing Tips

### Browser Setup
1. **Chrome**: Use regular window + incognito windows
2. **Multiple Browsers**: Chrome, Firefox, Safari for different users
3. **Mobile Testing**: Use browser dev tools or actual mobile devices

### Testing Workflow
1. **Plan your scenario**: Decide which users will interact
2. **Login simultaneously**: Open multiple windows with different demo users
3. **Test interactions**: Send messages, create matches, schedule sessions
4. **Verify real-time updates**: Check if changes appear instantly across windows

## 📋 Key Features to Test

### ✅ Authentication & Profiles
- [ ] Demo login works smoothly
- [ ] Profile information displays correctly
- [ ] Profile editing and updates work
- [ ] User avatars and information are consistent

### ✅ Skills Management
- [ ] View existing skills by category
- [ ] Add new skills (both existing and custom)
- [ ] Edit skill proficiency levels
- [ ] Remove skills from profile

### ✅ Skill Matching
- [ ] Browse skills and find teachers
- [ ] Send match requests with messages
- [ ] Accept/decline match requests
- [ ] View match history and status

### ✅ Messaging System
- [ ] Real-time message delivery
- [ ] Message read status updates
- [ ] Unread message counters
- [ ] Message history persistence

### ✅ Session Management
- [ ] Schedule new sessions
- [ ] View upcoming sessions
- [ ] Edit/cancel sessions
- [ ] Session status updates

### ✅ Dashboard & Navigation
- [ ] Dashboard statistics accuracy
- [ ] Navigation between pages
- [ ] Responsive design on different screen sizes
- [ ] Loading states and error handling

## 🐛 What to Look For

### Bugs & Issues
- Broken links or navigation
- UI elements not displaying correctly
- Real-time features not working
- Data not saving or loading properly
- Mobile responsiveness issues

### User Experience
- Confusing workflows or unclear instructions
- Missing feedback or confirmation messages
- Slow loading times
- Inconsistent design elements

### Edge Cases
- Empty states (no skills, no matches, etc.)
- Long text content (names, descriptions)
- Special characters in input fields
- Network connectivity issues

## 📝 Reporting Issues

When you find issues, please note:
1. **Which demo user** you were using
2. **What you were trying to do** (step-by-step)
3. **What happened** vs **what you expected**
4. **Browser and device** information
5. **Screenshots** if helpful

## 🔧 Advanced Testing

### Database Setup (Optional)
If you want richer demo data, run the `demo-users-setup.sql` script in your Supabase SQL editor after creating the demo users. This adds:
- Detailed user profiles
- Multiple skills per user
- Realistic skill descriptions
- Proper proficiency levels

### Custom Test Scenarios
Feel free to create your own test scenarios based on:
- Your specific use cases
- Edge cases you want to explore
- Integration testing between features
- Performance testing with multiple users

## 🎯 Success Metrics

A successful test session should demonstrate:
- ✅ Smooth user onboarding and profile setup
- ✅ Intuitive skill discovery and matching
- ✅ Reliable real-time communication
- ✅ Effective session scheduling and management
- ✅ Consistent user experience across different user types

---

**Happy Testing! 🚀**

*The demo system is designed to give you a comprehensive view of barterly's capabilities. Each demo user represents a different persona and use case, so try multiple accounts to get the full experience.* 