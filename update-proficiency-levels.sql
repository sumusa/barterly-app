-- Migration Script: Update Proficiency Levels from 1-10 to 1-4 Scale
-- Run this in your Supabase SQL editor to update existing data

-- First, update the database constraint
ALTER TABLE public.user_skills DROP CONSTRAINT IF EXISTS user_skills_proficiency_level_check;
ALTER TABLE public.user_skills ADD CONSTRAINT user_skills_proficiency_level_check 
  CHECK (proficiency_level >= 1 AND proficiency_level <= 4);

-- Update existing proficiency levels to the new 4-level scale
-- Old scale: 1-2 = Beginner, 3-4 = Intermediate, 5-7 = Advanced, 8-10 = Expert
-- New scale: 1 = Beginner, 2 = Intermediate, 3 = Advanced, 4 = Expert

UPDATE public.user_skills 
SET proficiency_level = CASE 
  WHEN proficiency_level <= 2 THEN 1  -- Beginner
  WHEN proficiency_level <= 4 THEN 2  -- Intermediate  
  WHEN proficiency_level <= 7 THEN 3  -- Advanced
  ELSE 4                              -- Expert
END
WHERE proficiency_level > 4;

-- Verify the update
SELECT 
  proficiency_level,
  COUNT(*) as count
FROM public.user_skills 
GROUP BY proficiency_level 
ORDER BY proficiency_level; 