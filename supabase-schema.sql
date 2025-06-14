-- Barterly Database Schema
-- Run this in your Supabase SQL editor to create all necessary tables

-- Create custom types
CREATE TYPE skill_type AS ENUM ('teach', 'learn');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'file', 'system');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table
CREATE TABLE public.skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skills (what they can teach or want to learn)
CREATE TABLE public.user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    skill_type skill_type NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id, skill_type)
);

-- Skill matches (teacher-learner pairs)
CREATE TABLE public.skill_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    learner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    status match_status DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, learner_id, skill_id)
);

-- Sessions
CREATE TABLE public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.skill_matches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    meeting_url TEXT,
    status session_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.skill_matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Reviews/Ratings
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, reviewer_id)
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample skills
INSERT INTO public.skills (name, category) VALUES
('JavaScript', 'Programming'),
('React', 'Programming'),
('Python', 'Programming'),
('TypeScript', 'Programming'),
('Node.js', 'Programming'),
('SQL', 'Programming'),
('HTML/CSS', 'Programming'),
('Vue.js', 'Programming'),
('Angular', 'Programming'),
('Java', 'Programming'),
('C++', 'Programming'),
('Go', 'Programming'),
('Rust', 'Programming'),
('Swift', 'Programming'),
('Kotlin', 'Programming'),

('UI/UX Design', 'Design'),
('Figma', 'Design'),
('Adobe Photoshop', 'Design'),
('Adobe Illustrator', 'Design'),
('Sketch', 'Design'),
('Canva', 'Design'),
('Graphic Design', 'Design'),
('Web Design', 'Design'),
('Brand Design', 'Design'),
('Typography', 'Design'),

('Digital Marketing', 'Marketing'),
('SEO', 'Marketing'),
('Content Marketing', 'Marketing'),
('Social Media Marketing', 'Marketing'),
('Email Marketing', 'Marketing'),
('PPC Advertising', 'Marketing'),
('Analytics', 'Marketing'),
('Copywriting', 'Marketing'),

('Photography', 'Creative'),
('Video Editing', 'Creative'),
('Music Production', 'Creative'),
('Writing', 'Creative'),
('Illustration', 'Creative'),
('Animation', 'Creative'),
('3D Modeling', 'Creative'),

('Spanish', 'Languages'),
('French', 'Languages'),
('German', 'Languages'),
('Mandarin', 'Languages'),
('Japanese', 'Languages'),
('Portuguese', 'Languages'),
('Italian', 'Languages'),
('Korean', 'Languages'),
('Arabic', 'Languages'),

('Public Speaking', 'Soft Skills'),
('Leadership', 'Soft Skills'),
('Project Management', 'Soft Skills'),
('Communication', 'Soft Skills'),
('Time Management', 'Soft Skills'),
('Critical Thinking', 'Soft Skills'),
('Problem Solving', 'Soft Skills'),
('Teamwork', 'Soft Skills'),

('Guitar', 'Music'),
('Piano', 'Music'),
('Violin', 'Music'),
('Drums', 'Music'),
('Singing', 'Music'),
('Music Theory', 'Music'),

('Cooking', 'Lifestyle'),
('Baking', 'Lifestyle'),
('Fitness Training', 'Lifestyle'),
('Yoga', 'Lifestyle'),
('Meditation', 'Lifestyle'),
('Gardening', 'Lifestyle'),
('DIY/Crafts', 'Lifestyle');

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills policies (public read)
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);

-- User skills policies
CREATE POLICY "Anyone can view user skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

-- Skill matches policies
CREATE POLICY "Users can view their matches" ON public.skill_matches FOR SELECT USING (auth.uid() = teacher_id OR auth.uid() = learner_id);
CREATE POLICY "Users can create matches as learner" ON public.skill_matches FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Users can update their matches" ON public.skill_matches FOR UPDATE USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- Sessions policies
CREATE POLICY "Users can view their sessions" ON public.sessions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.skill_matches 
        WHERE skill_matches.id = sessions.match_id 
        AND (skill_matches.teacher_id = auth.uid() OR skill_matches.learner_id = auth.uid())
    )
);
CREATE POLICY "Users can manage their sessions" ON public.sessions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.skill_matches 
        WHERE skill_matches.id = sessions.match_id 
        AND (skill_matches.teacher_id = auth.uid() OR skill_matches.learner_id = auth.uid())
    )
);

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.skill_matches 
        WHERE skill_matches.id = messages.match_id 
        AND (skill_matches.teacher_id = auth.uid() OR skill_matches.learner_id = auth.uid())
    )
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_skill_matches_teacher_id ON public.skill_matches(teacher_id);
CREATE INDEX idx_skill_matches_learner_id ON public.skill_matches(learner_id);
CREATE INDEX idx_skill_matches_skill_id ON public.skill_matches(skill_id);
CREATE INDEX idx_messages_match_id ON public.messages(match_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_sessions_match_id ON public.sessions(match_id);
CREATE INDEX idx_sessions_scheduled_at ON public.sessions(scheduled_at);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_matches_updated_at BEFORE UPDATE ON public.skill_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- This will add any existing auth users to the public.users table
INSERT INTO public.users (id, email, full_name)
SELECT 
  auth.users.id, 
  auth.users.email, 
  COALESCE(auth.users.raw_user_meta_data->>'full_name', split_part(auth.users.email, '@', 1))
FROM auth.users 
WHERE auth.users.id NOT IN (SELECT id FROM public.users); 