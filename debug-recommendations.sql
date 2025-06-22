-- Debug script to check user skills and test recommendations
-- Run this in your Supabase SQL editor

-- 1. Check Alex's skills (what he wants to learn)
SELECT 
  u.full_name,
  u.email,
  s.name as skill_name,
  s.category,
  us.skill_type,
  us.proficiency_level
FROM users u
JOIN user_skills us ON u.id = us.user_id
JOIN skills s ON us.skill_id = s.id
WHERE u.email = 'alex@demo.barterly.com'
ORDER BY us.skill_type, s.name;

-- 2. Check Sarah's skills (what she can teach)
SELECT 
  u.full_name,
  u.email,
  s.name as skill_name,
  s.category,
  us.skill_type,
  us.proficiency_level
FROM users u
JOIN user_skills us ON u.id = us.user_id
JOIN skills s ON us.skill_id = s.id
WHERE u.email = 'sarah@demo.barterly.com'
ORDER BY us.skill_type, s.name;

-- 3. Check if there's a UI/UX Design skill in the skills table
SELECT * FROM skills WHERE name ILIKE '%UI/UX%' OR name ILIKE '%design%';

-- 4. Test the recommendation function for Alex
SELECT * FROM get_recommended_matches(
  (SELECT id FROM users WHERE email = 'alex@demo.barterly.com')
);

-- 5. Manual check for potential matches
SELECT 
  learner.full_name as learner_name,
  learner_skill.skill_id as learner_skill_id,
  learner_skill.skill_type as learner_skill_type,
  teacher.full_name as teacher_name,
  teacher_skill.skill_id as teacher_skill_id,
  teacher_skill.skill_type as teacher_skill_type,
  s.name as skill_name
FROM users learner
JOIN user_skills learner_skill ON learner.id = learner_skill.user_id
JOIN user_skills teacher_skill ON learner_skill.skill_id = teacher_skill.skill_id
JOIN users teacher ON teacher_skill.user_id = teacher.id
JOIN skills s ON learner_skill.skill_id = s.id
WHERE learner.email = 'alex@demo.barterly.com'
  AND learner_skill.skill_type = 'learn'
  AND teacher_skill.skill_type = 'teach'
  AND learner.id != teacher.id; 