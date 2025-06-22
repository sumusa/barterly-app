import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Star, 
  Send, 
  X,
  User,
  Calendar,
  Clock
} from 'lucide-react'

interface ReviewFormProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  sessionTitle: string
  revieweeId: string
  revieweeName: string
  sessionDate: string
  sessionDuration: number
  onReviewSubmitted?: () => void
}

export default function ReviewForm({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
  revieweeId,
  revieweeName,
  sessionDate,
  sessionDuration,
  onReviewSubmitted
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating', {
        description: 'Your rating helps other users make informed decisions.',
        duration: 4000,
      })
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to submit a review')
        return
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          session_id: sessionId,
          reviewer_id: user.id,
          reviewee_id: revieweeId,
          rating,
          comment: comment.trim() || null
        })

      if (error) {
        console.error('Error submitting review:', error)
        toast.error('Failed to submit review', {
          description: 'Please try again or contact support if the problem persists.',
          duration: 4000,
        })
        return
      }

      toast.success('Review Submitted Successfully! ⭐', {
        description: `Thank you for your feedback on your session with ${revieweeName}.`,
        duration: 4000,
      })

      // Reset form
      setRating(0)
      setComment('')
      onReviewSubmitted?.()
      onClose()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review', {
        description: 'Something went wrong. Please try again.',
        duration: 4000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getRatingDescription = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor - Not helpful at all'
      case 2: return 'Fair - Could be better'
      case 3: return 'Good - Met expectations'
      case 4: return 'Very Good - Exceeded expectations'
      case 5: return 'Excellent - Outstanding experience'
      default: return 'Select a rating'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Rate Your Experience</CardTitle>
                <p className="text-sm text-slate-600">Share your feedback</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session Info */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-900">{sessionTitle}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">{revieweeName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {new Date(sessionDate).toLocaleDateString()} • {sessionDuration} minutes
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              How would you rate this experience? *
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600 text-center">
              {getRatingDescription(hoveredRating || rating)}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Additional Comments (Optional)
            </label>
            <Textarea
              placeholder="Share your experience, what went well, or suggestions for improvement..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Your feedback helps the community</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Submit Review</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 