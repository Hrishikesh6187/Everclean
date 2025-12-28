import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Star, Shield, Clock, Award, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const Home = () => {
  const [searchInput, setSearchInput] = useState('');
  const [zipCode, setZipCode] = useState('');
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const handleSearch = () => {
    // Only navigate if at least one search parameter is provided
    if (searchInput.trim() || zipCode.trim()) {
      navigate('/book-services', { 
        state: { 
          selectedService: searchInput.trim(),
          zipCode: zipCode.trim(),
          fromSearch: true
        }
      });
    }
  };

  const services = [
    { name: 'House Cleaning', icon: '🧹', description: 'Professional cleaning services for your home' },
    { name: 'Plumbing', icon: '🔧', description: 'Fix leaks, clogs, and other plumbing issues' },
    { name: 'Electrical', icon: '⚡', description: 'Electrical repairs and installations' },
    { name: 'Landscaping', icon: '🌱', description: 'Lawn care and garden maintenance' },
    { name: 'Painting', icon: '🎨', description: 'Interior and exterior painting services' },
    { name: 'Handyman', icon: '🔨', description: 'General repairs and home maintenance' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-blue-600 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Find trusted pros for</span>
                  <span className="block text-blue-200">your home services</span>
                </h1>
                <p className="mt-3 text-base text-blue-200 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Connect with qualified professionals for cleaning, repairs, maintenance, and more. Get the help you need, when you need it.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/apply" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400 md:py-4 md:text-lg md:px-10">
                      Join as Pro
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Home cleaning service"
          />
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-grow mb-4 md:mb-0 md:mr-4">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                  placeholder="What service do you need?"
                />
              </div>
            </div>
            <div className="flex-grow mb-4 md:mb-0 md:mr-4">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 px-4 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Zip Code"
                />
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center"
            >
              Find Pros
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Popular Services
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Browse our most requested services and find the right professional for your needs.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-xl">
                  <div className="p-6">
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{service.description}</p>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          navigate('/book-services', { 
                            state: { 
                              selectedService: service.name,
                              fromSearch: true
                            }
                          });
                        }}
                        className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
                      >
                        Find pros
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Getting help is easy with Ever Clean Home Servicing.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">1. Describe your project</h3>
                <p className="mt-2 text-base text-gray-500">
                  Tell us what you need help with and get free quotes from qualified pros.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">2. Choose the right pro</h3>
                <p className="mt-2 text-base text-gray-500">
                  Compare prices, reviews, and qualifications to find the perfect match for your needs.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">3. Get it done</h3>
                <p className="mt-2 text-base text-gray-500">
                  Book your service and pay securely through our platform when the job is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Don't just take our word for it — hear from our satisfied customers.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "The cleaning service was exceptional. The team was thorough, professional, and left my home spotless. I'll definitely be using Ever Clean again!"
                </p>
                <div className="font-medium">Sarah T.</div>
                <div className="text-sm text-gray-500">New York, NY</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "I needed urgent plumbing repairs and found a pro through Ever Clean within an hour. The plumber was knowledgeable, fixed the issue quickly, and charged a fair price."
                </p>
                <div className="font-medium">Michael R.</div>
                <div className="text-sm text-gray-500">Chicago, IL</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "The landscaping team transformed my yard completely. They were creative, hardworking, and the results exceeded my expectations. Highly recommend!"
                </p>
                <div className="font-medium">Jennifer L.</div>
                <div className="text-sm text-gray-500">Austin, TX</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Ever Clean
            </h2>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Verified Professionals</h3>
                <p className="mt-2 text-base text-gray-500">
                  All pros undergo thorough background checks and verification.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Quality Guarantee</h3>
                <p className="mt-2 text-base text-gray-500">
                  We stand behind the quality of our service providers.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">24/7 Support</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our customer service team is always available to help.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Satisfaction Guaranteed</h3>
                <p className="mt-2 text-base text-gray-500">
                  Not happy? We'll work to make it right or your money back.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Find the perfect pro today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/apply" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400">
                Join as Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;