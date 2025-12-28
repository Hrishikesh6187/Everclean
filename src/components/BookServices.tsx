import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

// Types and Interfaces
interface Freelancer {
  freelancer_id: string;
  application_id: string;
  profile_photo: string;
  hourly_pay: number;
  service_days: string[];
  freelancer_info: {
    first_name: string;
    last_name: string;
    skill: string[];
    years_of_experience: number;
    zip_codes: string[];
  };
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface BookingData {
  freelancer_id: string;
  service_type: string[];
  booking_date: string;
  booking_time: string;
  service_address: string;
  special_instructions?: string;
  estimated_duration: string;
  total_estimate: number;
}

interface PlatformFee {
  fee_percentage: number;
  tax_percentage: number;
}

export default function BookServices() {
  const location = useLocation();
  const navigate = useNavigate();

  // State Management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchService, setSearchService] = useState('');
  const [searchZipCode, setSearchZipCode] = useState('');
  
    useEffect(() => {
      if (location.state?.selectedService) {
        setSearchService(location.state.selectedService);
        setSelectedServices([location.state.selectedService]);
      }
      if (location.state?.zipCode) {
        setSearchZipCode(location.state.zipCode);
      }
    }, [location.state]);
  
  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesService = !searchService || 
      freelancer.freelancer_info.skill.some(skill => 
        skill.toLowerCase().includes(searchService.toLowerCase())
      );
    
    const matchesZipCode = !searchZipCode ||
      freelancer.freelancer_info.zip_codes.includes(searchZipCode);

    return matchesService && matchesZipCode;
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [platformFee, setPlatformFee] = useState<PlatformFee>({
    fee_percentage: 10,
    tax_percentage: 7
  });
  const [bookingData, setBookingData] = useState<BookingData>({
    freelancer_id: '',
    service_type: [],
    booking_date: '',
    booking_time: '',
    service_address: '',
    special_instructions: '',
    estimated_duration: '2 hours',
    total_estimate: 0
  });
  const [serviceDays, setServiceDays] = useState<string[]>([]);

  useEffect(() => {
    fetchFreelancers();
    fetchPlatformFees();
    if (!location.state?.fromSearch) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    if (!user) navigate('/login');
  };

  const fetchPlatformFees = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (data) {
        setPlatformFee({
          fee_percentage: data.fee_percentage,
          tax_percentage: 7
        });
      }
    } catch (error) {
      console.error('Error fetching platform fees:', error);
      setPlatformFee({ fee_percentage: 10, tax_percentage: 7 });
    }
  };

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('approved_freelancers')
        .select(`
          freelancer_id,
          application_id,
          profile_photo,
          hourly_pay,
          service_days,
          freelancer_info:freelancer_applications(
            first_name,
            last_name,
            skill,
            years_of_experience,
            zip_codes
          )
        `);

      if (error) throw error;
      if (data) setFreelancers(data);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setError('Failed to load freelancers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalEstimate = (hourlyRate: number): number => {
    const estimatedHours = 2;
    const subtotal = hourlyRate * estimatedHours;
    const platformFeeAmount = (subtotal * platformFee.fee_percentage) / 100;
    const taxAmount = (subtotal * platformFee.tax_percentage) / 100;
    return subtotal + platformFeeAmount + taxAmount;
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setSelectedServices([]);
    setSelectedDate('');
    setBookingData({
      freelancer_id: '',
      service_type: [],
      booking_date: '',
      booking_time: '',
      service_address: '',
      special_instructions: '',
      estimated_duration: '2 hours',
      total_estimate: 0
    });
  };

  const handleDateChange = async (date: string) => {
    try {
      const selectedDay = new Date(date + 'T00:00:00Z').toLocaleString('en-US', {
        weekday: 'long',
        timeZone: 'UTC'
      });

      if (serviceDays.includes(selectedDay)) {
        setSelectedDate(date);
        generateTimeSlots(date, bookingData.freelancer_id);
      } else {
        alert(`Please select a valid service day. Available days are: ${serviceDays.join(', ')}`);
        setSelectedDate('');
      }
    } catch (error) {
      console.error('Error handling date change:', error);
      alert('Error validating service day');
    }
  };

  const handleBookNowClick = async (freelancerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('approved_freelancers')
        .select('service_days')
        .eq('freelancer_id', freelancerId)
        .single();

      if (error) throw error;
      setServiceDays(data?.service_days || []);
      setBookingData(prev => ({ ...prev, freelancer_id: freelancerId }));
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching service days:', error);
      alert('Error fetching freelancer availability');
    }
  };

  const generateTimeSlots = async (date: string, freelancerId: string) => {
    try {
      const { data: freelancerData, error: freelancerError } = await supabase
        .from('approved_freelancers')
        .select('start_time, end_time')
        .eq('freelancer_id', freelancerId)
        .single();

      if (freelancerError) throw freelancerError;

      const startTime = new Date(`${date}T${freelancerData.start_time}`);
      const endTime = new Date(`${date}T${freelancerData.end_time}`);
      const slots: TimeSlot[] = [];

      while (startTime < endTime) {
        const slotStart = startTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });

        startTime.setHours(startTime.getHours() + 2);
        const slotEnd = startTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });

        slots.push({
          start: slotStart,
          end: slotEnd,
          available: true
        });

        startTime.setHours(startTime.getHours() + 1);
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error generating time slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleBooking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const selectedFreelancer = freelancers.find(f => f.freelancer_id === bookingData.freelancer_id);
      const totalEstimate = calculateTotalEstimate(selectedFreelancer?.hourly_pay || 0);

      const { data: homeownerData, error: homeownerError } = await supabase
        .from('homeowners')
        .select('first_name, last_name')
        .eq('homeowner_id', user.id)
        .single();

      if (homeownerError) throw homeownerError;

      const bookingPayload = {
        homeowner_id: user.id,
        freelancer_id: bookingData.freelancer_id,
        first_name: homeownerData.first_name,
        last_name: homeownerData.last_name,
        service_type: selectedServices,
        booking_date: selectedDate,
        booking_time: bookingData.booking_time,
        service_address: bookingData.service_address,
        special_instructions: bookingData.special_instructions || '',
        hourly_rate: selectedFreelancer?.hourly_pay || 0,
        estimated_duration: '2 hours',
        total_estimate: totalEstimate,
        status: 'pending'
      };

      const { error } = await supabase
        .from('service_bookings')
        .insert(bookingPayload);

      if (error) throw error;
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error booking services:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  // Render Components
  const renderSuccessModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 border w-[480px] shadow-lg rounded-md bg-white text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Booking Successful!</h3>
        <p className="text-gray-600 mb-4">Your service has been scheduled successfully.</p>
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <p className="text-sm text-blue-800">
            You will receive a confirmation email shortly with your booking details.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/dashboard');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              setShowSuccessModal(false);
              resetModal();
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Book Another Service
          </button>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Book Services</h2>
        <button
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back
        </button>
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search by Service
          </label>
          <input
            type="text"
            placeholder="Enter service type..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchService}
            onChange={(e) => setSearchService(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search by ZIP Code
          </label>
          <input
            type="text"
            placeholder="Enter ZIP code..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchZipCode}
            onChange={(e) => setSearchZipCode(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading freelancers...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Freelancers Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFreelancers.map((freelancer) => (
            <div key={freelancer.freelancer_id} className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow bg-white">
              <div className="flex flex-col items-center">
                {freelancer.profile_photo ? (
                  <img
                    src={freelancer.profile_photo}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <span className="text-2xl text-gray-500">
                      {freelancer.freelancer_info.first_name[0]}
                      {freelancer.freelancer_info.last_name[0]}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {freelancer.freelancer_info.first_name} {freelancer.freelancer_info.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    ${freelancer.hourly_pay.toFixed(2)}/hour
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Service Area: {freelancer.freelancer_info.zip_codes.join(", ")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {freelancer.freelancer_info.skill.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleBookNowClick(freelancer.freelancer_id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Book Service</h3>
              
              {/* Service Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Services
                </label>
                <select
                  multiple
                  className="w-full p-2 border rounded-md"
                  value={selectedServices}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedServices(selected);
                    setBookingData(prev => ({ ...prev, service_type: selected }));
                  }}
                >
                  {freelancers
                    .find(f => f.freelancer_id === bookingData.freelancer_id)
                    ?.freelancer_info.skill.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                </select>
              </div>

              {/* Service Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Address
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={bookingData.service_address}
                  onChange={(e) => setBookingData(prev => ({ ...prev, service_address: e.target.value }))}
                  placeholder="Enter service address"
                />
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <div className="mb-2 text-sm text-gray-600">
                  {serviceDays.join(', ')}
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time Slots */}
              {selectedDate && availableSlots.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setBookingData(prev => ({ ...prev, booking_time: slot.start }))}
                        disabled={!slot.available}
                        className={`p-2 text-sm rounded-md ${
                          bookingData.booking_time === slot.start
                            ? 'bg-blue-600 text-white'
                            : slot.available
                            ? 'bg-gray-100 hover:bg-gray-200'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.start} - {slot.end}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  value={bookingData.special_instructions}
                  onChange={(e) => setBookingData(prev => ({ ...prev, special_instructions: e.target.value }))}
                  placeholder="Any special instructions..."
                  rows={3}
                />
              </div>

              {/* Cost Estimate - Only show when time is selected */}
              {bookingData.booking_time && (
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Estimated Cost</h4>
                {(() => {
                  const selectedFreelancer = freelancers.find(f => f.freelancer_id === bookingData.freelancer_id);
                  const hourlyRate = selectedFreelancer?.hourly_pay || 0;
                  const hours = 2; // Fixed 2-hour duration
                  const subtotal = hourlyRate * hours;
                  const platformFeeAmount = (subtotal * platformFee.fee_percentage) / 100;
                  const taxAmount = (subtotal * platformFee.tax_percentage) / 100;
                  const total = subtotal + platformFeeAmount + taxAmount;

                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Rate:</span>
                        <span className="text-gray-900">${hourlyRate.toFixed(2)}/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="text-gray-900">{hours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee ({platformFee.fee_percentage}%):</span>
                        <span className="text-gray-900">${platformFeeAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax ({platformFee.tax_percentage}%):</span>
                        <span className="text-gray-900">${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                        <span className="text-gray-900">Total Estimate:</span>
                        <span className="text-gray-900">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              )}

              {/* Booking Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!selectedServices.length || !selectedDate || !bookingData.booking_time || !bookingData.service_address}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && renderSuccessModal()}
    </div>
  );
}