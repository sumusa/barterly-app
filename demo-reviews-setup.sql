-- Demo Reviews Setup Script
-- Run this in your Supabase SQL editor to add sample reviews for testing

-- This script will create sample sessions and reviews for the demo users
-- Note: Make sure demo users and skills are already set up

-- Function to safely add demo reviews
CREATE OR REPLACE FUNCTION add_demo_review(
  session_title TEXT,
  teacher_email TEXT,
  learner_email TEXT,
  rating INTEGER,
  comment TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  teacher_id UUID;
  learner_id UUID;
  session_id UUID;
  match_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO teacher_id FROM public.users WHERE email = teacher_email;
  SELECT id INTO learner_id FROM public.users WHERE email = learner_email;
  
  -- Skip if users don't exist
  IF teacher_id IS NULL OR learner_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Create a sample skill match
  INSERT INTO public.skill_matches (teacher_id, learner_id, skill_id, status, message)
  SELECT 
    teacher_id,
    learner_id,
    (SELECT id FROM public.skills WHERE name = 'React' LIMIT 1),
    'completed',
    'Great learning session!'
  ON CONFLICT (teacher_id, learner_id, skill_id) DO NOTHING
  RETURNING id INTO match_id;
  
  -- Create a sample session
  INSERT INTO public.sessions (match_id, title, description, scheduled_at, duration_minutes, status)
  VALUES (
    match_id,
    session_title,
    'Sample learning session for testing reviews',
    NOW() - INTERVAL '2 days',
    60,
    'completed'
  )
  RETURNING id INTO session_id;
  
  -- Add the review
  INSERT INTO public.reviews (session_id, reviewer_id, reviewee_id, rating, comment)
  VALUES (session_id, learner_id, teacher_id, rating, comment)
  ON CONFLICT (session_id, reviewer_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Add sample reviews
SELECT add_demo_review(
  'React Fundamentals Session',
  'alex@demo.barterly.com',
  'sarah@demo.barterly.com',
  5,
  'Alex is an excellent teacher! He explained React concepts clearly and was very patient with my questions. Highly recommend!'
);

SELECT add_demo_review(
  'UI/UX Design Workshop',
  'sarah@demo.barterly.com',
  'david@demo.barterly.com',
  4,
  'Sarah has great design skills and provided valuable feedback on my marketing materials. Very helpful session!'
);

SELECT add_demo_review(
  'Guitar Lesson - Beginner',
  'marcus@demo.barterly.com',
  'emma@demo.barterly.com',
  5,
  'Marcus is a fantastic guitar teacher! He made learning fun and I can already play a few chords. Can''t wait for the next lesson!'
);

SELECT add_demo_review(
  'Spanish Conversation Practice',
  'emma@demo.barterly.com',
  'alex@demo.barterly.com',
  4,
  'Emma is a great Spanish tutor. She helped me practice conversation and corrected my pronunciation. Very patient and encouraging!'
);

SELECT add_demo_review(
  'SEO Strategy Session',
  'david@demo.barterly.com',
  'marcus@demo.barterly.com',
  5,
  'David provided excellent SEO advice for my music teaching website. His insights were practical and actionable. Highly recommend!'
);

-- Add a few more reviews for variety
SELECT add_demo_review(
  'Advanced React Patterns',
  'alex@demo.barterly.com',
  'david@demo.barterly.com',
  4,
  'Great session on advanced React concepts. Alex knows his stuff and explains complex topics well.'
);

SELECT add_demo_review(
  'Design System Workshop',
  'sarah@demo.barterly.com',
  'emma@demo.barterly.com',
  5,
  'Sarah helped me understand design systems and how to create consistent UI components. Very informative!'
);

SELECT add_demo_review(
  'Music Theory Basics',
  'marcus@demo.barterly.com',
  'sarah@demo.barterly.com',
  4,
  'Marcus made music theory accessible and fun. Great foundation for understanding music better.'
);

-- Clean up the helper function
DROP FUNCTION IF EXISTS add_demo_review(TEXT, TEXT, TEXT, INTEGER, TEXT); 