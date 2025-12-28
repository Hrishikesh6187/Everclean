import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface CompletedBooking {
  booking_id: string;
  service_type: string[];
  booking_date: string;
  freelancer: {
    freelancer_id: string;
    freelancer_applications: {
      first_name: string;
      last_name: string;
    }
  }
}

export default function RateService() {
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [reviews, setReviews] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;

      // First, get all completed bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('service_bookings')
        .select(`
          booking_id,
          service_type,
          booking_date,
          freelancer:approved_freelancers (
            freelancer_id,
            freelancer_applications (
              first_name,
              last_name
            )
          )
        `)
        .eq('homeowner_id', user.id)
        .eq('status', 'completed')
        .order('booking_date', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Then, get all existing reviews
      const { data: existingReviews, error: reviewsError } = await supabase
        .from('service_reviews')
        .select('booking_id')
        .eq('homeowner_id', user.id);

      if (reviewsError) throw reviewsError;

      // Filter out bookings that already have reviews
      const reviewedBookingIds = new Set(existingReviews?.map(review => review.booking_id));
      const unreviewedBookings = bookings?.filter(booking => !reviewedBookingIds.has(booking.booking_id));

      setCompletedBookings(unreviewedBookings || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
      setLoading(false);
    }
  };

  const handleRatingChange = (bookingId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [bookingId]: rating }));
  };

  const handleReviewChange = (bookingId: string, review: string) => {
    setReviews(prev => ({ ...prev, [bookingId]: review }));
  };

  const submitReview = async (booking: CompletedBooking) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;

      const { error } = await supabase
        .from('service_reviews')
        .insert({
          booking_id: booking.booking_id,
          freelancer_id: booking.freelancer.freelancer_id,
          homeowner_id: user.id,
          rating: ratings[booking.booking_id],
          review_text: reviews[booking.booking_id],
        });

      if (error) throw error;
      
      // Clear the form and refresh the bookings
      setRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[booking.booking_id];
        return newRatings;
      });
      setReviews(prev => {
        const newReviews = { ...prev };
        delete newReviews[booking.booking_id];
        return newReviews;
      });
      fetchCompletedBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Rate Your Services</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : completedBookings.length === 0 ? (
          <p>No completed services to rate</p>
        ) : (
          <div className="space-y-6">
            {completedBookings.map((booking) => (
              <div key={booking.booking_id} className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    {booking.service_type.join(', ')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Provider: {booking.freelancer.freelancer_applications.first_name} {booking.freelancer.freelancer_applications.last_name}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(booking.booking_id, star)}
                        className="focus:outline-none"
                      >
                        {star <= (ratings[booking.booking_id] || 0) ? (
                          <StarIcon className="h-6 w-6 text-yellow-400" />
                        ) : (
                          <StarOutlineIcon className="h-6 w-6 text-yellow-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={reviews[booking.booking_id] || ''}
                  onChange={(e) => handleReviewChange(booking.booking_id, e.target.value)}
                  placeholder="Write your review here..."
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                  rows={3}
                />

                <button
                  onClick={() => submitReview(booking)}
                  disabled={!ratings[booking.booking_id] || !reviews[booking.booking_id]}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}