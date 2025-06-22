# Barterly Review System Guide

## Overview

The review system allows users to rate and review their learning/teaching experiences after completing sessions. This helps build trust and credibility within the community.

## Features Implemented

### 1. Review Form Component (`src/components/ReviewForm.tsx`)
- **5-star rating system** with hover effects
- **Optional comment field** (500 character limit)
- **Session information display** (title, partner, date, duration)
- **Form validation** and error handling
- **Success notifications** using Sonner toast

### 2. Review Display Component (`src/components/ReviewDisplay.tsx`)
- **Average rating calculation** and display
- **Rating distribution** (1-5 stars with visual bars)
- **Individual review cards** with reviewer info and comments
- **Expandable reviews list** (show more/less functionality)
- **Empty state** for users with no reviews

### 3. Database Integration (`src/lib/supabase.ts`)
- **Review creation and retrieval** functions
- **User review statistics** calculation
- **Session review checking** (prevent duplicate reviews)
- **Enhanced skill metrics** with real review data

### 4. UI Integration
- **Public Profile pages** show user reviews
- **Matches page** includes review prompts for completed sessions
- **Skill pages** display aggregated teacher ratings

## Database Schema

```sql
-- Reviews table structure
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
```

## How to Test the Review System

### Step 1: Setup Demo Data

1. **Run the demo users setup script** (if not already done):
   ```sql
   -- Run demo-users-setup.sql in Supabase SQL editor
   ```

2. **Run the demo reviews setup script**:
   ```sql
   -- Run demo-reviews-setup.sql in Supabase SQL editor
   ```

### Step 2: Test Review Display

1. **Login as any demo user** (e.g., `alex@demo.barterly.com`)
2. **Visit another user's public profile**:
   - Go to `/profile/[user-id]` or click on a user's name
   - Scroll down to see the "Reviews" section
   - Verify that reviews are displayed with ratings and comments

3. **Test review statistics**:
   - Check that average rating is calculated correctly
   - Verify rating distribution bars show proper percentages
   - Test "Show More" functionality if there are many reviews

### Step 3: Test Review Form

1. **Create a completed session** (for testing):
   - You can manually create a session in the database or
   - Use the demo data that includes completed sessions

2. **Access review form**:
   - Go to `/matches` page
   - Look for completed matches with "Review" buttons
   - Click the "Review" button to open the form

3. **Test form functionality**:
   - **Star rating**: Click stars to set rating (1-5)
   - **Hover effects**: Stars should highlight on hover
   - **Comment field**: Type optional feedback (max 500 chars)
   - **Form validation**: Try submitting without rating
   - **Success flow**: Submit review and verify success message

### Step 4: Test Review Integration

1. **Check skill ratings**:
   - Go to `/skills` page
   - Look for skills with teacher ratings displayed
   - Verify ratings are based on actual reviews

2. **Test review uniqueness**:
   - Try to review the same session twice
   - Verify that duplicate reviews are prevented

3. **Check profile updates**:
   - After submitting a review, check that the reviewee's profile shows updated stats
   - Verify average rating and review count are updated

## Demo User Review Data

The demo script creates the following sample reviews:

| Teacher | Learner | Skill | Rating | Comment |
|---------|---------|-------|--------|---------|
| Alex | Sarah | React | 5⭐ | "Alex is an excellent teacher! He explained React concepts clearly..." |
| Sarah | David | UI/UX Design | 4⭐ | "Sarah has great design skills and provided valuable feedback..." |
| Marcus | Emma | Guitar | 5⭐ | "Marcus is a fantastic guitar teacher! He made learning fun..." |
| Emma | Alex | Spanish | 4⭐ | "Emma is a great Spanish tutor. She helped me practice conversation..." |
| David | Marcus | SEO | 5⭐ | "David provided excellent SEO advice for my music teaching website..." |

## API Functions

### Database Functions Added

```typescript
// Get all reviews for a user
db.getUserReviews(userId: string): Promise<Review[]>

// Get review statistics for a user
db.getUserReviewStats(userId: string): Promise<{
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}>

// Create a new review
db.createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review | null>

// Get reviews for a specific session
db.getSessionReviews(sessionId: string): Promise<Review[]>

// Check if user has already reviewed a session
db.hasUserReviewedSession(userId: string, sessionId: string): Promise<boolean>
```

## Component Props

### ReviewForm Props
```typescript
interface ReviewFormProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  sessionTitle: string
  revieweeId: string
  revieweeName: string
  revieweeEmail: string
  sessionDate: string
  sessionDuration: number
  onReviewSubmitted?: () => void
}
```

### ReviewDisplay Props
```typescript
interface ReviewDisplayProps {
  userId: string
  userName: string
  showAll?: boolean
  maxReviews?: number
}
```

## Security Features

- **Row Level Security (RLS)** policies ensure users can only:
  - View all reviews (public information)
  - Create reviews for sessions they participated in
  - Update their own reviews
- **Unique constraint** prevents duplicate reviews per session
- **Rating validation** ensures ratings are between 1-5

## Future Enhancements

1. **Review responses**: Allow teachers to respond to reviews
2. **Review helpfulness**: Let users mark reviews as helpful
3. **Review filtering**: Filter reviews by rating, date, etc.
4. **Review notifications**: Notify users when they receive new reviews
5. **Review analytics**: Dashboard showing review trends and insights

## Troubleshooting

### Common Issues

1. **Reviews not showing**: Check if the user has any reviews in the database
2. **Review form not opening**: Verify the session exists and is marked as completed
3. **Rating not updating**: Check browser console for errors, verify database permissions
4. **Duplicate reviews**: The system prevents this automatically via database constraints

### Database Queries for Debugging

```sql
-- Check all reviews
SELECT * FROM reviews ORDER BY created_at DESC;

-- Check reviews for a specific user
SELECT * FROM reviews WHERE reviewee_id = 'user-id-here';

-- Check review statistics
SELECT 
  reviewee_id,
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating
FROM reviews 
GROUP BY reviewee_id;
```

## Conclusion

The review system provides a comprehensive way for users to share feedback about their learning experiences. It enhances trust, helps users make informed decisions about teachers, and creates a more engaging community experience.

The system is designed to be scalable, secure, and user-friendly, with clear visual feedback and intuitive interactions. 