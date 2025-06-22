-- Demo Users Setup Script
-- Run this in your Supabase SQL editor after users have been created through the demo login

-- This script will populate demo users with skills and sample data
-- Note: The users need to be created first through the demo login component

-- Function to safely add user skills (only if user exists)
CREATE OR REPLACE FUNCTION add_demo_user_skill(
  user_email TEXT,
  skill_name TEXT,
  skill_category TEXT,
  skill_type_param skill_type,
  proficiency_level INTEGER,
  description TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  found_user_id UUID;
  found_skill_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO found_user_id FROM public.users WHERE email = user_email;
  
  -- Skip if user doesn't exist
  IF found_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get or create skill
  SELECT id INTO found_skill_id FROM public.skills WHERE name = skill_name AND category = skill_category;
  
  IF found_skill_id IS NULL THEN
    INSERT INTO public.skills (name, category, description)
    VALUES (skill_name, skill_category, description)
    RETURNING id INTO found_skill_id;
  END IF;
  
  -- Add user skill (ignore if already exists)
  INSERT INTO public.user_skills (user_id, skill_id, skill_type, proficiency_level, description)
  VALUES (found_user_id, found_skill_id, skill_type_param, proficiency_level, description)
  ON CONFLICT (user_id, skill_id, skill_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Alex Chen - Full-Stack Developer
SELECT add_demo_user_skill('alex@demo.barterly.com', 'React', 'Programming', 'teach', 4, 'Expert in React with 5+ years of experience building complex applications');
SELECT add_demo_user_skill('alex@demo.barterly.com', 'Node.js', 'Programming', 'teach', 3, 'Backend development with Express, APIs, and database integration');
SELECT add_demo_user_skill('alex@demo.barterly.com', 'TypeScript', 'Programming', 'teach', 3, 'Strong typing for JavaScript applications');
SELECT add_demo_user_skill('alex@demo.barterly.com', 'UI/UX Design', 'Design', 'learn', 2, 'Want to improve my design skills to create better user experiences');

-- Sarah Johnson - UX Designer
SELECT add_demo_user_skill('sarah@demo.barterly.com', 'Figma', 'Design', 'teach', 4, 'Professional UI/UX designer with expertise in design systems');
SELECT add_demo_user_skill('sarah@demo.barterly.com', 'UI/UX Design', 'Design', 'teach', 4, 'Creating user-centered designs for web and mobile applications');
SELECT add_demo_user_skill('sarah@demo.barterly.com', 'JavaScript', 'Programming', 'learn', 1, 'Learning to code to better collaborate with developers');
SELECT add_demo_user_skill('sarah@demo.barterly.com', 'Photography', 'Creative', 'teach', 3, 'Portrait and product photography for design projects');

-- Marcus Rodriguez - Music Teacher
SELECT add_demo_user_skill('marcus@demo.barterly.com', 'Guitar', 'Music', 'teach', 4, 'Professional guitarist with 15+ years of teaching experience');
SELECT add_demo_user_skill('marcus@demo.barterly.com', 'Piano', 'Music', 'teach', 3, 'Classical and contemporary piano instruction');
SELECT add_demo_user_skill('marcus@demo.barterly.com', 'Music Theory', 'Music', 'teach', 4, 'Comprehensive music theory from beginner to advanced levels');
SELECT add_demo_user_skill('marcus@demo.barterly.com', 'Digital Marketing', 'Marketing', 'learn', 1, 'Want to promote my music teaching business online');

-- Emma Wilson - Language Tutor
SELECT add_demo_user_skill('emma@demo.barterly.com', 'Spanish', 'Languages', 'teach', 4, 'Native Spanish speaker with teaching certification');
SELECT add_demo_user_skill('emma@demo.barterly.com', 'French', 'Languages', 'teach', 3, 'Fluent French speaker living in France for 3 years');
SELECT add_demo_user_skill('emma@demo.barterly.com', 'Public Speaking', 'Soft Skills', 'teach', 3, 'Confident presenter and communication coach');
SELECT add_demo_user_skill('emma@demo.barterly.com', 'HTML/CSS', 'Programming', 'learn', 1, 'Complete beginner wanting to build a website for my tutoring business');

-- David Kim - Marketing Specialist
SELECT add_demo_user_skill('david@demo.barterly.com', 'SEO', 'Marketing', 'teach', 3, 'Search engine optimization specialist with proven results');
SELECT add_demo_user_skill('david@demo.barterly.com', 'Social Media Marketing', 'Marketing', 'teach', 4, 'Expert in Instagram, TikTok, and LinkedIn marketing strategies');
SELECT add_demo_user_skill('david@demo.barterly.com', 'Content Marketing', 'Marketing', 'teach', 3, 'Creating engaging content that converts');
SELECT add_demo_user_skill('david@demo.barterly.com', 'Photography', 'Creative', 'learn', 2, 'Want to take better photos for marketing campaigns');

-- Update user profiles with more detailed information
UPDATE public.users 
SET 
  full_name = 'Alex Chen',
  bio = 'Full-stack developer passionate about creating amazing user experiences. I love teaching React and modern web development while learning design principles.',
  location = 'San Francisco, CA',
  timezone = 'America/Los_Angeles'
WHERE email = 'alex@demo.barterly.com';

UPDATE public.users 
SET 
  full_name = 'Sarah Johnson',
  bio = 'UX Designer focused on creating intuitive and beautiful digital experiences. Always eager to learn new technologies to better collaborate with development teams.',
  location = 'New York, NY',
  timezone = 'America/New_York'
WHERE email = 'sarah@demo.barterly.com';

UPDATE public.users 
SET 
  full_name = 'Marcus Rodriguez',
  bio = 'Professional musician and music educator with over 15 years of experience. I teach guitar, piano, and music theory while exploring digital marketing.',
  location = 'Austin, TX',
  timezone = 'America/Chicago'
WHERE email = 'marcus@demo.barterly.com';

UPDATE public.users 
SET 
  full_name = 'Emma Wilson',
  bio = 'Polyglot language tutor specializing in Spanish and French. I help students achieve fluency through immersive conversation practice.',
  location = 'Miami, FL',
  timezone = 'America/New_York'
WHERE email = 'emma@demo.barterly.com';

UPDATE public.users 
SET 
  full_name = 'David Kim',
  bio = 'Digital marketing specialist helping businesses grow their online presence. Expert in SEO, social media, and content marketing strategies.',
  location = 'Seattle, WA',
  timezone = 'America/Los_Angeles'
WHERE email = 'david@demo.barterly.com';

-- Clean up the helper function
DROP FUNCTION IF EXISTS add_demo_user_skill(TEXT, TEXT, TEXT, skill_type, INTEGER, TEXT); 