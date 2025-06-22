-- Recommendation function for Barterly
-- This function finds recommended teachers based on user's learning goals

CREATE OR REPLACE FUNCTION get_recommended_matches(user_id_param UUID)
RETURNS TABLE (
  teacher_id UUID,
  teacher_name TEXT,
  teacher_email TEXT,
  skill_name TEXT,
  skill_category TEXT,
  proficiency_level INTEGER,
  teacher_bio TEXT,
  teacher_location TEXT,
  compatibility_score INTEGER,
  match_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.user_id as teacher_id,
    u.full_name as teacher_name,
    u.email as teacher_email,
    s.name as skill_name,
    s.category as skill_category,
    us.proficiency_level,
    u.bio as teacher_bio,
    u.location as teacher_location,
    -- Calculate compatibility score
    (
      -- Location bonus (10 points if same location)
      CASE 
        WHEN u.location = (SELECT location FROM users WHERE id = user_id_param) THEN 10
        ELSE 0
      END +
      -- Skill level bonus (higher proficiency = better teacher)
      CASE 
        WHEN us.proficiency_level = 4 THEN 8
        WHEN us.proficiency_level = 3 THEN 6
        WHEN us.proficiency_level = 2 THEN 4
        ELSE 2
      END +
      -- Bio bonus (more detailed bio = better match)
      CASE 
        WHEN u.bio IS NOT NULL AND length(u.bio) > 50 THEN 3
        ELSE 0
      END +
      -- Base score
      5
    ) as compatibility_score,
    -- Generate match reason
    CASE 
      WHEN u.location = (SELECT location FROM users WHERE id = user_id_param) THEN 'Local expert in ' || s.name
      WHEN us.proficiency_level = 4 THEN 'Expert level ' || s.name || ' teacher'
      WHEN us.proficiency_level = 3 THEN 'Advanced ' || s.name || ' instructor'
      ELSE 'Skilled ' || s.name || ' teacher'
    END as match_reason
  FROM user_skills us
  JOIN users u ON us.user_id = u.id
  JOIN skills s ON us.skill_id = s.id
  WHERE us.skill_type = 'teach'
  AND us.user_id != user_id_param
  AND EXISTS (
    SELECT 1 FROM user_skills learner_skills
    WHERE learner_skills.user_id = user_id_param
    AND learner_skills.skill_type = 'learn'
    AND learner_skills.skill_id = us.skill_id
  )
  ORDER BY compatibility_score DESC
  LIMIT 12;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_recommended_matches(UUID) TO authenticated; 