import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import AdminPosts from './AdminPosts';

interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

interface FreelancerApplication {
  application_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: string;
  created_at: string;
  skill: string[];
  date_of_birth: string;
  years_of_experience: number;
  address: string;
  ssn: string;
  zip_codes: string[];
  payment_details: {
    account_number: string;
    routing_number: string;
  };
  proof_of_id: string;
  media?: {
    media_id: string;
    media_name: string;
    pdf_file: string;
    document_url: string[];
  }[];
}

interface Homeowner {
  homeowner_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  created_at: string;
}

interface Freelancer {
  freelancer_id: string;
  application_id: string;
  freelancer_applications: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
}

interface ServiceBooking {
  booking_id: string;
  status: string;
  created_at: string;
  service_type: string[];
  booking_date: string;
  booking_time: string;
  service_address: string;
  special_instructions?: string;
  estimated_duration?: string;
  price_estimate?: number;
  homeowner: Homeowner;
  freelancer: {
    freelancer_id: string;
    freelancer_applications: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
    };
  };
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface ToastProps extends Toast {
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => (
  <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white flex items-center space-x-2`}>
    <span>{message}</span>
    <button 
      onClick={onClose}
      className="ml-4 text-white hover:text-gray-200"
    >
      ×
    </button>
  </div>
);

const AdminDashboard = () => {
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [applications, setApplications] = useState<FreelancerApplication[]>([]);
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<ServiceBooking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingApplications, setProcessingApplications] = useState<Set<string>>(new Set());
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
      fetchData();
  }, [activeTab, page]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if admin already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', adminFormData.email)
        .single();
      
      if (existingAdmin) {
        throw new Error('This email is already registered as an admin. Please use a different email.');
      }

      // Create auth user in Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: adminFormData.email,
        password: adminFormData.password,
      });

      if (signUpError) {
        console.error('Auth signup error details:', {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name,
          code: signUpError?.code
        });

        if (signUpError.message?.includes('already registered')) {
          throw new Error('This email is already registered. Please use a different email.');
        }
        throw signUpError;
      }

      if (!authData?.user?.id) {
        console.error('Auth signup succeeded but no user ID was returned');
        throw new Error('Account creation failed: No user ID was generated');
      }

      // Create admin record
      const { error: adminError } = await supabase
        .from('admins')
        .insert([
          {
            admin_id: authData.user.id,
            first_name: adminFormData.firstName,
            last_name: adminFormData.lastName,
            email: adminFormData.email,
            password: adminFormData.password,
            phone_number: adminFormData.phoneNumber,
            address: adminFormData.address
          }
        ]);

      if (adminError) {
        console.error('Admin creation error details:', {
          message: adminError.message,
          code: adminError.code,
          details: adminError.details,
          hint: adminError.hint
        });
        
        // If admin creation fails, clean up the auth user
        await supabase.auth.signOut();
        
        if (adminError.code === '23505') {
          throw new Error('This email is already associated with an admin account.');
        }
        throw new Error('Failed to create admin profile: ' + adminError.message);
      }

      setToast({
        message: 'Admin account created successfully!',
        type: 'success'
      });
      setShowAdminModal(false);
      setAdminFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: ''
      });
    } catch (err) {
      console.error('Error creating admin:', err);
      setError(err instanceof Error ? err.message : 'Failed to create admin account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (activeTab) {
      setLoading(true);
    }
    setError(null);
    try {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage - 1;

      switch (activeTab) {
        case 'applications':
          const { data: appData, error: appError } = await supabase
            .from('freelancer_applications')
            .select(`
              *,
              media (media_id, media_name, pdf_file,document_url)
            `)
            .eq('status', 'pending') // Only fetch pending applications
            .order('created_at', { ascending: false })
            .range(startIndex, endIndex);

          if (appError) throw appError;
          setApplications(appData || []);
          break;

        case 'homeowners':
          const { data: homeData, error: homeError } = await supabase
            .from('homeowners')
            .select('*')
            .order('created_at', { ascending: false })
            .range(startIndex, endIndex);

          if (homeError) throw homeError;
          setHomeowners(homeData || []);
          break;

        case 'freelancers':
          const { data: freeData, error: freeError } = await supabase
            .from('approved_freelancers')
            .select(`
              freelancer_id,
              application_id,
              freelancer_applications!inner (
                first_name,
                last_name,
                email,
                phone_number
              )
            `)
            .range(startIndex, endIndex);

          if (freeError) throw freeError;
          setFreelancers(freeData || []);
          break;

        case 'upcoming':
          const { data: upcomingData, error: upcomingError } = await supabase
            .from('service_bookings')
            .select(`
              *,
              homeowner:homeowners!inner (*),
              freelancer:approved_freelancers!inner (
                freelancer_id,
                freelancer_applications!inner (
                  first_name,
                  last_name,
                  email,
                  phone_number
                )
              )
            `)
            .in('status', ['pending', 'in_progress'])
            .range(startIndex, endIndex);

          if (upcomingError) throw upcomingError;
          setUpcomingBookings(upcomingData || []);
          break;

        case 'finished':
          const { data: finishedData, error: finishedError } = await supabase
            .from('service_bookings')
            .select(`
              *,
              homeowner:homeowners!inner (*),
              freelancer:approved_freelancers!inner (
                freelancer_id,
                freelancer_applications!inner (
                  first_name,
                  last_name,
                  email,
                  phone_number
                )
              )
            `)
            .eq('status', 'completed')
            .range(startIndex, endIndex);

          if (finishedError) throw finishedError;
          setCompletedBookings(finishedData || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    setProcessingApplications(prev => new Set(prev).add(applicationId));

    setApplications(prevApplications => 
      prevApplications.map(app => 
        app.application_id === applicationId 
          ? { ...app, status } 
          : app
      )
    );
  
    try {
      const { error: updateError } = await supabase
        .from('freelancer_applications')
        .update({ status })
        .eq('application_id', applicationId);
  
      if (updateError) throw updateError;
  
      if (status === 'approved') {
        // Fetch the freelancer application data
        const { data: freelancerData, error: fetchError } = await supabase
          .from('freelancer_applications')
          .select('*')
          .eq('application_id', applicationId)
          .single();
  
        if (fetchError) throw fetchError;
  
        if (freelancerData) {
          // Create password using last 4 digits of SSN
          const last4SSN = freelancerData.ssn.slice(-4);
          const password = `password${last4SSN}`;
  
          // Create auth user in Supabase
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: freelancerData.email,
            password: password,
          });
  
          if (signUpError) {
            console.error('Auth signup error:', signUpError);
            throw new Error('Failed to create authentication account for freelancer');
          }
  
          if (!authData?.user?.id) {
            throw new Error('No user ID returned from authentication signup');
          }
  
          // Create approved freelancer record using Supabase-generated UUID
          const { error: insertError } = await supabase
            .from('approved_freelancers')
            .insert([
              {
                freelancer_id: authData.user.id,
                application_id: applicationId,
                email: freelancerData.email,
                password: password
              }
            ]);
  
          if (insertError) throw insertError;
        }
      }

      setToast({
        message: `Application successfully ${status === 'approved' ? 'approved' : 'rejected'}!`,
        type: 'success'
      });

      await fetchData();
    } catch (error) {
      console.error('Error in handleApplicationStatus:', error);
      setError('Failed to update application status. Please try again.');

      const { data: currentData } = await supabase
        .from('freelancer_applications')
        .select('*')
        .eq('application_id', applicationId)
        .single();
  
      if (currentData) {
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.application_id === applicationId
              ? { ...app, status: currentData.status }
              : app
          )
        );
      }
    } finally {
      setProcessingApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const renderPagination = () => {
    const getCurrentDataLength = () => {
      switch (activeTab) {
        case 'applications':
          return applications.length;
        case 'homeowners':
          return homeowners.length;
        case 'freelancers':
          return freelancers.length;
        case 'upcoming':
          return upcomingBookings.length;
        case 'finished':
          return completedBookings.length;
        default:
          return 0;
      }
    };

    // Don't show pagination if we don't have enough items
    if (getCurrentDataLength() < itemsPerPage && page === 1) {
      return null;
    }

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading || getCurrentDataLength() < itemsPerPage}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    );
  };

  const renderApplications = () => {
    return applications.map((app) => (
      <div key={app.application_id} className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{app.first_name} {app.last_name}</h3>
            <p><span className="font-medium">Email:</span> {app.email}</p>
            <p><span className="font-medium">Phone:</span> {app.phone_number}</p>
            <p><span className="font-medium">Date of Birth:</span> {new Date(app.date_of_birth).toLocaleDateString()}</p>
            <p><span className="font-medium">Years of Experience:</span> {app.years_of_experience}</p>
            <p><span className="font-medium">Address:</span> {app.address}</p>
            <p><span className="font-medium">SSN:</span> {app.ssn}</p>
          </div>
          <div>
            <p><span className="font-medium">Skills:</span> {app.skill.join(', ')}</p>
            <p><span className="font-medium">Zip Codes:</span> {app.zip_codes.join(', ')}</p>
            <p><span className="font-medium">Status:</span> 
              <span className="text-yellow-600 capitalize">
                {app.status}
              </span>
            </p>
          </div>
        </div>
        
        {app.status === 'pending' && (
          <div className="col-span-2 mt-4 flex space-x-4">
            <button
              onClick={() => handleApplicationStatus(app.application_id, 'approved')}
              disabled={processingApplications.has(app.application_id)}
              className={`px-4 py-2 rounded ${
                processingApplications.has(app.application_id)
                  ? 'bg-gray-400'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {processingApplications.has(app.application_id) ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => handleApplicationStatus(app.application_id, 'rejected')}
              disabled={processingApplications.has(app.application_id)}
              className={`px-4 py-2 rounded ${
                processingApplications.has(app.application_id)
                  ? 'bg-gray-400'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {processingApplications.has(app.application_id) ? 'Processing...' : 'Reject'}
            </button>
          </div>
        )}

        {app.media && app.media.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-lg font-semibold mb-2">Documents</h4>
            <div className="grid grid-cols-2 gap-4">
              {app.media.map((file) => (
                <div key={file.media_id} className="border rounded p-3">
                  <p className="text-sm mb-2">{file.media_name}</p>
                  <div className="flex justify-between items-center">
                    <a
                      href={file.document_url[0]}
                      download={file.media_name}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ));
  };

  const renderHomeowners = () => {
    return homeowners.map((homeowner) => (
      <div key={homeowner.homeowner_id} className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{homeowner.first_name} {homeowner.last_name}</h3>
            <p><span className="font-medium">Email:</span> {homeowner.email}</p>
            <p><span className="font-medium">Phone:</span> {homeowner.phone_number}</p>
            <p><span className="font-medium">Address:</span> {homeowner.address}</p>
            <p><span className="font-medium">Member Since:</span> {new Date(homeowner.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    ));
  };

  const renderFreelancers = () => {
    return freelancers.map((freelancer) => (
      <div key={freelancer.freelancer_id} className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {freelancer.freelancer_applications.first_name} {freelancer.freelancer_applications.last_name}
            </h3>
            <p><span className="font-medium">Email:</span> {freelancer.freelancer_applications.email}</p>
            <p><span className="font-medium">Phone:</span> {freelancer.freelancer_applications.phone_number}</p>
          </div>
        </div>
      </div>
    ));
  };

  const renderBookings = (bookings: ServiceBooking[]) => {
    return bookings.map((booking) => (
      <div key={booking.booking_id} className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Booking Details</h3>
            <p><span className="font-medium">Service Type:</span> {booking.service_type.join(', ')}</p>
            <p><span className="font-medium">Date:</span> {new Date(booking.booking_date).toLocaleDateString()}</p>
            <p><span className="font-medium">Time:</span> {booking.booking_time}</p>
            <p><span className="font-medium">Address:</span> {booking.service_address}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`capitalize ${
                booking.status === 'completed' ? 'text-green-600' : 
                booking.status === 'cancelled' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {booking.status}
              </span>
            </p>
            {booking.special_instructions && (
              <p><span className="font-medium">Special Instructions:</span> {booking.special_instructions}</p>
            )}
            {booking.estimated_duration && (
              <p><span className="font-medium">Estimated Duration:</span> {booking.estimated_duration}</p>
            )}
            {booking.price_estimate && (
              <p><span className="font-medium">Price Estimate:</span> ${booking.price_estimate}</p>
            )}
          </div>
          <div>
            <h4 className="text-md font-semibold mb-2">Client</h4>
            <p>{booking.homeowner.first_name} {booking.homeowner.last_name}</p>
            <p>{booking.homeowner.email}</p>
            <p>{booking.homeowner.phone_number}</p>
            
            <h4 className="text-md font-semibold mb-2 mt-4">Service Provider</h4>
            <p>{booking.freelancer.freelancer_applications.first_name} {booking.freelancer.freelancer_applications.last_name}</p>
            <p>{booking.freelancer.freelancer_applications.email}</p>
            <p>{booking.freelancer.freelancer_applications.phone_number}</p>
          </div>
        </div>
      </div>
    ));
  };

  const AdminCreationModal = ({
    isOpen,
    onClose,
    onAdminCreated
  }: {
    isOpen: boolean;
    onClose: () => void;
    onAdminCreated: (toastMessage: string) => void;
  }) => {
    const [formData, setFormData] = useState<AdminFormData>({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      address: ''
    });
  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      if (!isOpen) {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phoneNumber: '',
          address: ''
        });
        setError(null);
      }
    }, [isOpen]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.address) {
        setError('Please fill in all required fields.');
        return;
      }

      setLoading(true);
      setError(null);
  
      try {
        // Check if admin already exists
        const { data: existingAdmin, error: checkError } = await supabase
          .from('admins')
          .select('email')
          .eq('email', formData.email)
          .single();
        
        if (existingAdmin) {
          throw new Error('This email is already registered as an admin. Please use a different email.');
        }

        // Create auth user in Supabase
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });
  
        if (signUpError) {
          if (signUpError.message?.includes('already registered')) {
            throw new Error('This email is already registered. Please use a different email.');
          }
          throw signUpError;
        }
  
        if (!authData?.user?.id) {
          throw new Error('Account creation failed: No user ID was generated');
        }
  
        // Create admin record
        const { error: adminError } = await supabase
          .from('admins')
          .insert([{
            admin_id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone_number: formData.phoneNumber,
            address: formData.address
          }]);
  
        if (adminError) {
          // If admin creation fails, clean up the auth user
          await supabase.auth.signOut();
          
          if (adminError.code === '23505') {
            throw new Error('This email is already associated with an admin account.');
          }
          throw new Error('Failed to create admin profile: ' + adminError.message);
        }
  
        onAdminCreated('Admin account created successfully!');
        onClose();
      } catch (err) {
        console.error('Error creating admin:', err);
        setError(err instanceof Error ? err.message : 'Failed to create admin account. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Admin Account</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
  
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  

  const [totalCounts, setTotalCounts] = useState({
    pendingApplications: 0,
    totalHomeowners: 0,
    activeFreelancers: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalPosts: 0
  });


  useEffect(() => {
    fetchTotalCounts();
  }, []);

  const fetchTotalCounts = async () => {
    try {
      const [
        { count: pendingApps },
        { count: homeowners },
        { count: freelancers },
        { count: upcoming },
        { count: completed },
        { count: posts }
      ] = await Promise.all([
        supabase
          .from('freelancer_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('homeowners')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('approved_freelancers')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('service_bookings')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'in_progress']),
        supabase
          .from('service_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
      ]);
  
      setTotalCounts({
        pendingApplications: pendingApps || 0,
        totalHomeowners: homeowners || 0,
        activeFreelancers: freelancers || 0,
        upcomingBookings: upcoming || 0,
        completedBookings: completed || 0,
        totalPosts: posts || 0
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const getSummaryStats = () => {
    return {
      applications: {
        pending: totalCounts.pendingApplications,
      },
      homeowners: {
        total: totalCounts.totalHomeowners,
      },
      freelancers: {
        total: totalCounts.activeFreelancers,
      },
      bookings: {
        upcoming: totalCounts.upcomingBookings,
        completed: totalCounts.completedBookings,
      },
      posts: {
        total: totalCounts.totalPosts,
      }
    };
  };

  const StatusCard = ({ 
    title, 
    count, 
    color, 
    onClick, 
    isActive 
  }: { 
    title: string; 
    count: number; 
    color: string;
    onClick: () => void;
    isActive: boolean;
  }) => (
    <div 
      onClick={onClick}
      className={`${color} rounded-lg p-6 shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isActive ? 'ring-4 ring-white ring-opacity-60' : ''
      }`}
    >
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white">{count}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAdminModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Admin
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>


      {/* Admin Creation Modal */}
      <AdminCreationModal
      isOpen={showAdminModal}
      onClose={() => setShowAdminModal(false)}
      onAdminCreated={(toastMessage) => {
        setToast({ message: toastMessage, type: 'success' });
        }}
        />

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatusCard 
          title="Pending Applications" 
          count={getSummaryStats().applications.pending}
          color="bg-amber-500"
          onClick={() => setActiveTab('applications')}
          isActive={activeTab === 'applications'}
        />
        <StatusCard 
          title="Total Homeowners" 
          count={getSummaryStats().homeowners.total}
          color="bg-sky-500"
          onClick={() => setActiveTab('homeowners')}
          isActive={activeTab === 'homeowners'}
        />
        <StatusCard 
          title="Active Freelancers" 
          count={getSummaryStats().freelancers.total}
          color="bg-emerald-500"
          onClick={() => setActiveTab('freelancers')}
          isActive={activeTab === 'freelancers'}
        />
        <StatusCard 
          title="Upcoming Bookings" 
          count={getSummaryStats().bookings.upcoming}
          color="bg-fuchsia-500"
          onClick={() => setActiveTab('upcoming')}
          isActive={activeTab === 'upcoming'}
        />
        <StatusCard 
          title="Completed Bookings" 
          count={getSummaryStats().bookings.completed}
          color="bg-indigo-500"
          onClick={() => setActiveTab('finished')}
          isActive={activeTab === 'finished'}
        />
        <StatusCard 
          title="Manage Posts" 
          count={getSummaryStats().posts.total}
          color="bg-rose-500"
          onClick={() => setActiveTab('posts')}
          isActive={activeTab === 'posts'}
        />
      </div>

      {/* Content Section */}
      {activeTab && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {activeTab === 'applications' && 'Pending Applications'}
            {activeTab === 'homeowners' && 'Total Homeowners'}
            {activeTab === 'freelancers' && 'Active Freelancers'}
            {activeTab === 'upcoming' && 'Upcoming Bookings'}
            {activeTab === 'finished' && 'Completed Bookings'}
            {activeTab === 'posts' && 'Manage Freelancer Posts'}
          </h2>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'applications' && renderApplications()}
          {activeTab === 'homeowners' && renderHomeowners()}
          {activeTab === 'freelancers' && renderFreelancers()}
          {activeTab === 'upcoming' && renderBookings(upcomingBookings)}
          {activeTab === 'finished' && renderBookings(completedBookings)}
          {activeTab === 'posts' && <AdminPosts />}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
