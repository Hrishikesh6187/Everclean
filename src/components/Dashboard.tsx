import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

const recommendations = [
  'House Cleaning',
  'Plumbing',
  'Painting',
  'Handyman',
  'Landscaping',
  'Gutter Cleaning'
]

interface ServiceBooking {
  booking_id: string
  service_type: string[]
  booking_date: string
  status: string
  total_estimate: number
  freelancer: {
    freelancer_id: string
    freelancer_applications: {
      first_name: string
      last_name: string
    }
  }
}

interface HomeownerProfile {
  first_name: string
  last_name: string
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [profile, setProfile] = useState<HomeownerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [posts, setPosts] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const postsPerPage = 5
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    paymentMethod: 'creditCard',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking'
  });

  // Move handleLogout before the return statement
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    fetchUserData()
    fetchBookings()
    fetchPosts()
  }, [currentPage]);

  const Pagination = () => {
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    return (
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${currentPage === 1
              ? 'bg-gray-100 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          Next
        </button>
      </div>
    );
  };

  const fetchPosts = async () => {
    try {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      setTotalPosts(count || 0);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          freelancer:approved_freelancers (
            freelancer_applications (
              first_name,
              last_name
            )
          ),
          likes (
            like_id,
            homeowner_id
          ),
          comments (
            comment_id,
            comment_content,
            created_at,
            homeowner:homeowners (
              first_name,
              last_name
            ),
            freelancer:approved_freelancers (
              freelancer_applications (
                first_name,
                last_name
              )
            )
          )
        `)
        .range((currentPage - 1) * postsPerPage, currentPage * postsPerPage - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingLike } = await supabase
        .from('likes')
        .select('like_id')
        .eq('post_id', postId)
        .eq('homeowner_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('like_id', existingLike.like_id);
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            homeowner_id: user.id
          });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedPost) return;

      await supabase
        .from('comments')
        .insert({
          post_id: selectedPost.post_id,
          comment_content: newComment,
          homeowner_id: user.id
        });

      setNewComment('');
      setIsCommentModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;

      const { data, error: profileError } = await supabase
        .from('homeowners')
        .select('first_name, last_name')
        .eq('homeowner_id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const { data, error: bookingsError } = await supabase
        .from('service_bookings')
        .select(`
          booking_id,
          service_type,
          booking_date,
          status,
          total_estimate,
          freelancer:approved_freelancers (
            freelancer_id,
            freelancer_applications (
              first_name,
              last_name
            )
          )
        `)
        .eq('homeowner_id', user.id)
        .gte('booking_date', todayStr)
        .not('status', 'eq', 'completed')
        .order('booking_date', { ascending: true });

      if (bookingsError) throw bookingsError;
      setBookings(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  }

  const handleSendMessage = async (message: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user || !selectedBooking) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          content: message,
          sender_id: user.id,
          receiver_id: selectedBooking.freelancer.freelancer_id,
          booking_id: selectedBooking.booking_id
        });

      if (error) throw error;
      setIsMessageModalOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedBooking) return;

      // Update booking status to completed
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: 'completed' })
        .eq('booking_id', selectedBooking.booking_id);

      if (error) throw error;

      // Reset form and close payment modal
      setPaymentInfo({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: '',
        paymentMethod: 'creditCard',
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking'
      });
      setIsPaymentModalOpen(false);

      // Show success modal instead of alert
      setIsPaymentSuccessModalOpen(true);

      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-Ever Clean Home Servicing-blue">Ever Clean Home Servicing</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="#"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'dashboard'
                      ? 'border-Ever Clean Home Servicing-blue text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button className="relative p-1 text-gray-400 hover:text-gray-500">
                  <BellIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="ml-4">
                <button onClick={() => navigate('/profile')}>
                  <UserCircleIcon className="h-8 w-8 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Services */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">Upcoming Services</h3>
              </div>
              <div className="mt-4 space-y-4">
                {loading ? (
                  <p>Loading...</p>
                ) : bookings.length === 0 ? (
                  <p>No active services</p>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.booking_id} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {booking.service_type.join(', ')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Provider: {booking.freelancer.freelancer_applications.first_name} {booking.freelancer.freelancer_applications.last_name}
                          </p>
                          <div className="mt-2 flex space-x-2">
                            <button
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsMessageModalOpen(true);
                              }}
                            >
                              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                              Message Provider
                            </button>

                            {/* Add Pay Now button for bookings with 'Payment Pending' status */}
                            {booking.status === 'Payment Pending' && (
                              <button
                                className="inline-flex items-center text-sm text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsPaymentModalOpen(true);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                booking.status === 'Payment Pending' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                          }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <HomeIcon className="h-6 w-6 text-blue-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">Recommended Services</h3>
              </div>
              <div className="mt-4 space-y-4">
                {recommendations.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{service}</span>
                    <button
                      onClick={() => navigate('/book-services', {
                        state: { selectedService: service }
                      })}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <CogIcon className="h-6 w-6 text-blue-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/rate-service')}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <StarIcon className="h-6 w-6 text-blue-600" />
                  <span className="mt-2 text-sm text-gray-700">Rate Service</span>
                </button>
                <button
                  onClick={() => navigate('/book-services')}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                  <span className="mt-2 text-sm text-gray-700">Book Service</span>
                </button>
                <button
                  onClick={() => navigate('/booking-history')}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <HomeIcon className="h-6 w-6 text-blue-600" />
                  <span className="mt-2 text-sm text-gray-700">Booking History</span>
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <UserCircleIcon className="h-6 w-6 text-blue-600" />
                  <span className="mt-2 text-sm text-gray-700">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 col-span-2"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-600" />
                  <span className="mt-2 text-sm text-red-700">Logout</span>
                </button>
              </div>
            </div>
          </div>
          {/* Social Feed - Full width in mobile, 2 columns in desktop */}
          <div className="lg:col-span-3 bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center mb-6">
                <ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">Service Provider Posts</h3>
              </div>

              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.post_id} className="border-b pb-6">
                    <div className="flex items-start space-x-3">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {post.freelancer.freelancer_applications.first_name} {post.freelancer.freelancer_applications.last_name}
                        </p>
                        <p className="mt-1 text-gray-600">{post.post_content}</p>

                        {/* Image Gallery */}
                        {post.image_urls && post.image_urls.length > 0 && (
                          <div className="mt-3">
                            {post.image_urls.map((imageUrl: string, index: number) => (
                              <div key={index} className="mb-2">
                                <img
                                  src={imageUrl}
                                  alt={`Post image ${index + 1}`}
                                  className="w-full max-h-[500px] object-contain rounded-lg"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center space-x-4">
                          <button
                            onClick={() => handleLike(post.post_id)}
                            className="flex items-center text-gray-500 hover:text-blue-600"
                          >
                            <StarIcon className={`h-5 w-5 ${post.likes.some((like: any) => like.homeowner_id === profile?.homeowner_id)
                                ? 'text-blue-600'
                                : 'text-gray-400'
                              }`} />
                            <span className="ml-1">{post.likes.length}</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPost(post);
                              setIsCommentModalOpen(true);
                            }}
                            className="flex items-center text-gray-500 hover:text-blue-600"
                          >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                            <span className="ml-1">{post.comments.length}</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {post.comments.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {post.comments.map((comment: any) => (
                              <div key={comment.comment_id} className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-900">
                                  {comment.homeowner
                                    ? `${comment.homeowner.first_name} ${comment.homeowner.last_name}`
                                    : `${comment.freelancer.freelancer_applications.first_name} ${comment.freelancer.freelancer_applications.last_name}`}
                                </p>
                                <p className="text-sm text-gray-600">{comment.comment_content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Payment Information</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedBooking && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">Service: {selectedBooking.service_type.join(', ')}</p>
                <p className="text-sm">Provider: {selectedBooking.freelancer.freelancer_applications.first_name} {selectedBooking.freelancer.freelancer_applications.last_name}</p>
                <p className="text-sm">Date: {new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
                <p className="text-sm font-medium text-green-700">Total: ${selectedBooking.total_estimate}</p>
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-4">
              {/* Payment Method Selection */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentInfo.paymentMethod === 'creditCard'}
                      onChange={() => setPaymentInfo({ ...paymentInfo, paymentMethod: 'creditCard' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Credit Card</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="eCheck"
                      checked={paymentInfo.paymentMethod === 'eCheck'}
                      onChange={() => setPaymentInfo({ ...paymentInfo, paymentMethod: 'eCheck' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">eCheck</span>
                  </label>
                </div>
              </div>

              {/* Credit Card Fields */}
              {paymentInfo.paymentMethod === 'creditCard' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="nameOnCard"
                      value={paymentInfo.nameOnCard}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* eCheck Fields */}
              {paymentInfo.paymentMethod === 'eCheck' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <label htmlFor="nameOnAccount" className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Account
                    </label>
                    <input
                      type="text"
                      id="nameOnAccount"
                      value={paymentInfo.nameOnCard}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      id="routingNumber"
                      value={paymentInfo.routingNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, routingNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123456789"
                      maxLength={9}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      value={paymentInfo.accountNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12345678901234"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <select
                      id="accountType"
                      value={paymentInfo.accountType}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, accountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-between space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Complete Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Comment</h3>
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Write your comment..."
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCommentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {isPaymentSuccessModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
              <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>

            {selectedBooking && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg text-left">
                <p className="text-sm font-medium">Service: {selectedBooking.service_type.join(', ')}</p>
                <p className="text-sm">Provider: {selectedBooking.freelancer.freelancer_applications.first_name} {selectedBooking.freelancer.freelancer_applications.last_name}</p>
                <p className="text-sm">Date: {new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
                <p className="text-sm font-medium text-green-700">Amount Paid: ${selectedBooking.total_estimate}</p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setIsPaymentSuccessModalOpen(false);
                  navigate('/dashboard');
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setIsPaymentSuccessModalOpen(false);
                  navigate('/book-services');
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                Book Another Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Message to {selectedBooking?.freelancer.freelancer_applications.first_name} {selectedBooking?.freelancer.freelancer_applications.last_name}
              </h3>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const messageInput = e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement;
                handleSendMessage(messageInput.value);
                messageInput.value = '';
              }}
              className="space-y-4"
            >
              <textarea
                name="message"
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Type your message here..."
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}