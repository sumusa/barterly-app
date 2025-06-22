import { useState, useEffect } from 'react'
import { supabase, type Review } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Star, 
  Calendar,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface ReviewDisplayProps {
  userId: string
  userName: string
  maxReviews?: number
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export default function ReviewDisplay({ 
  userId, 
  userName, 
  maxReviews = 5 
}: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  })
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [userId])

  const loadReviews = async () => {
    try {
      // Get reviews for this user
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(
            id,
            full_name,
            email
          ),
          session:sessions(
            id,
            title,
            scheduled_at
          )
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading reviews:', error)
        return
      }

      setReviews(reviewsData || [])

      // Calculate stats
      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviewsData.length
        
        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        reviewsData.forEach(review => {
          distribution[review.rating]++
        })

        setStats({
          averageRating,
          totalReviews: reviewsData.length,
          ratingDistribution: distribution
        })
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayedReviews = expanded ? reviews : reviews.slice(0, maxReviews)

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (stats.totalReviews === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">No reviews yet</h3>
          <p className="text-xs text-slate-500">Be the first to review {userName}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardContent className="space-y-4">
        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating] || 0
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-8">
                  <span className="text-sm text-slate-600">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Reviews List */}
        {displayedReviews.length > 0 && (
          <div className="space-y-4">
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Reviews</h4>
            </div>
            
            {displayedReviews.map((review) => (
              <div key={review.id} className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {review.reviewer?.full_name?.[0] || review.reviewer?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {review.reviewer?.full_name || review.reviewer?.email?.split('@')[0] || 'Anonymous'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                {review.session && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{review.session.title}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Show More/Less Button */}
        {reviews.length > maxReviews && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full text-slate-600 hover:text-slate-900"
            >
              {expanded ? (
                <div className="flex items-center space-x-2">
                  <ChevronUp className="w-4 h-4" />
                  <span>Show Less</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ChevronDown className="w-4 h-4" />
                  <span>Show {reviews.length - maxReviews} More Reviews</span>
                </div>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 