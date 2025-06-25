# Barterly 🤝

> **Where Skills Meet Purpose** - An AI-powered skill-sharing platform that connects learners with teachers through intelligent matching.

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.0-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.8-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)

## 🌟 Live Demo

**[Try Barterly Now](https://barterly.netlify.app)**

Use the demo login feature to test the platform with pre-configured accounts!

## 📖 About

Barterly is a revolutionary skill-sharing platform that makes knowledge exchange seamless and intelligent. Whether you want to learn Spanish while teaching someone coding, or master photography while sharing your marketing expertise, Barterly's AI-powered matching system connects you with the perfect learning partner.

### ✨ Key Features

- **🤖 AI-Powered Matching**: Intelligent recommendation system that scores compatibility based on location, skill level, and profile quality
- **💬 Real-Time Messaging**: Built-in chat system with unread message counters and read receipts
- **📅 Session Management**: Schedule, track, and manage learning sessions with calendar integration
- **⭐ Review System**: Rate and review your learning experiences to build community trust
- **👤 User Profiles**: Detailed skill portfolios with proficiency ratings (1-4 scale)
- **🎯 Smart Recommendations**: Personalized match reasons like "Local expert in React" or "Expert level JavaScript teacher"
- **📱 Responsive Design**: Beautiful, modern UI that works perfectly on all devices
- **🚀 Demo Mode**: Quick login system for instant testing with pre-configured demo users

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **React Router DOM** - Client-side routing

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row-level security (RLS)
  - Authentication
- **Custom PostgreSQL Functions** - AI matching algorithm

### Deployment
- **Netlify** - Static site hosting
- **Supabase Cloud** - Database hosting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/barterly.git
   cd barterly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL scripts in the following order:
     1. `supabase-schema.sql` - Creates all tables and basic structure
     2. `recommendation-function.sql` - Creates the AI matching function
     3. `demo-users-setup.sql` - Sets up demo users (optional)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Database Setup

The project includes several SQL files for database setup:

- **`supabase-schema.sql`** - Complete database schema with tables, indexes, and RLS policies
- **`recommendation-function.sql`** - AI matching algorithm function
- **`demo-users-setup.sql`** - Demo user accounts for testing
- **`demo-reviews-setup.sql`** - Sample reviews and ratings

## 🏗️ Project Structure

```
barterly/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Radix UI components
│   │   ├── AddSkillForm.tsx
│   │   ├── DemoLogin.tsx
│   │   ├── Navbar.tsx
│   │   ├── ReviewForm.tsx
│   │   └── ReviewDisplay.tsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── SkillMatching.tsx
│   │   ├── Matches.tsx
│   │   ├── Messages.tsx
│   │   ├── Sessions.tsx
│   │   ├── Profile.tsx
│   │   └── Landing.tsx
│   ├── lib/                # Utilities and configurations
│   │   ├── supabase.ts     # Supabase client and database functions
│   │   └── utils.ts        # Helper functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # App entry point
├── public/                 # Static assets
├── supabase-schema.sql     # Database schema
├── recommendation-function.sql  # AI matching algorithm
└── package.json
```

## 🤖 AI Matching Algorithm

The core of Barterly is its intelligent matching system, implemented as a PostgreSQL function that:

- **Scores Compatibility**: Calculates a compatibility score based on:
  - Location matching (10 points for local experts)
  - Skill proficiency level (2-8 points based on expertise)
  - Profile quality (3 points for detailed bios)
  - Base score (5 points for all matches)

- **Generates Match Reasons**: Provides personalized explanations like:
  - "Local expert in React"
  - "Expert level JavaScript teacher"
  - "Advanced Python instructor"

- **Optimizes Results**: Returns the top 12 most compatible matches ordered by score

## 🔐 Security Features

- **Row-Level Security (RLS)**: Database-level security policies
- **Authentication**: Supabase Auth with email/password
- **Authorization**: User-specific data access controls
- **Input Validation**: Type-safe data handling with TypeScript

## 🎨 UI/UX Features

- **Modern Design**: Clean, gradient-based design with smooth animations
- **Responsive Layout**: Mobile-first approach with adaptive components
- **Loading States**: Beautiful loading animations and skeleton screens
- **Toast Notifications**: Rich toast notifications for user feedback
- **Dark Mode Ready**: Built with dark mode compatibility in mind

## 🧪 Testing

The platform includes a comprehensive demo system:

- **Demo Users**: Pre-configured accounts for testing
- **Sample Data**: Realistic skill sets and profiles
- **Quick Login**: Instant access to test all features

## 📱 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hai** - For incredible mentorship and guidance throughout development
- **Devin** - For helping establish the project foundation
- **GetCoding Team** - For the amazing learning environment
- **Supabase** - For the powerful backend-as-a-service platform
- **React Team** - For the amazing framework

## 📞 Contact

- **Project Link**: [https://github.com/yourusername/barterly](https://github.com/yourusername/barterly)
- **Live Demo**: [https://your-netlify-url.netlify.app](https://your-netlify-url.netlify.app)

---

**Built with ❤️ during Module 2 of GetCoding**

*"Where Skills Meet Purpose"*
