import React from 'react';

const AboutUs = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end mb-4">
            <a
              href="/"
              className="inline-flex items-center text-white hover:text-gray-200 transition-colors text-lg font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </a>
          </div>
          <h1 className="text-4xl font-bold mb-4">About Ever Clean Home Servicing</h1>
          <p className="text-xl max-w-3xl">
            Your trusted partner for all home service needs since 2025.
          </p>
        </div>
      </div>
      
      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission & Vision</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">Our Mission</h3>
              <p className="text-gray-700">
                Ever Clean Home Servicing is dedicated to simplifying home ownership by connecting 
                homeowners with trusted, vetted professionals. We strive to provide exceptional service 
                that exceeds expectations and makes home maintenance stress-free.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">Our Vision</h3>
              <p className="text-gray-700">
                We envision a world where every homeowner has access to reliable, affordable, and 
                high-quality home services. We aim to be the most trusted name in home services 
                across the nation, known for our integrity, quality, and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
        
        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">
              Founded in 2025, Ever Clean Home Servicing began with a simple idea: make home services 
              accessible, reliable, and hassle-free. What started as a small team of dedicated professionals 
              has grown into a nationwide network of over 500 certified experts.
            </p>
            <p className="text-gray-700 mb-4">
              Our founder, after experiencing firsthand the challenges of finding trustworthy service providers, 
              decided to create a platform that thoroughly vets professionals and guarantees quality work. 
              Today, we serve thousands of homeowners across the country, maintaining the same commitment 
              to excellence that defined us from day one.
            </p>
            <p className="text-gray-700">
              With every service we provide, we're not just maintaining homes – we're building trust and 
              creating lasting relationships with our customers and service professionals alike.
            </p>
          </div>
        </div>
        
        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Quality</h3>
              <p className="text-gray-700">
                We never compromise on the quality of our services. Every professional in our network 
                undergoes rigorous vetting and must maintain our high standards.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Reliability</h3>
              <p className="text-gray-700">
                When we make a commitment, we keep it. Our customers can count on us to show up on time 
                and complete work as promised, every time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Customer-First</h3>
              <p className="text-gray-700">
                Everything we do is centered around our customers' needs and satisfaction. We listen, 
                adapt, and go the extra mile to ensure an exceptional experience.
              </p>
            </div>
          </div>
        </div>
        
        {/* Our Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">Sarah Johnson</h3>
              <p className="text-blue-700 mb-2">Founder & CEO</p>
              <p className="text-gray-700 text-sm">
                With over 15 years in the home service industry, Sarah founded Ever Clean 
                with a vision to transform how homeowners access quality services.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">Michael Chen</h3>
              <p className="text-blue-700 mb-2">Chief Operations Officer</p>
              <p className="text-gray-700 text-sm">
                Michael ensures our operations run smoothly and efficiently, maintaining 
                our high standards across all service categories.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">Priya Patel</h3>
              <p className="text-blue-700 mb-2">Head of Professional Relations</p>
              <p className="text-gray-700 text-sm">
                Priya leads our professional vetting and onboarding process, ensuring 
                only the best service providers join our network.
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ever Clean By The Numbers</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-blue-700 text-white p-6 rounded-lg shadow-md">
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-lg">Certified Professionals</p>
            </div>
            <div className="bg-blue-700 text-white p-6 rounded-lg shadow-md">
              <p className="text-4xl font-bold mb-2">50,000+</p>
              <p className="text-lg">Completed Services</p>
            </div>
            <div className="bg-blue-700 text-white p-6 rounded-lg shadow-md">
              <p className="text-4xl font-bold mb-2">98%</p>
              <p className="text-lg">Customer Satisfaction</p>
            </div>
            <div className="bg-blue-700 text-white p-6 rounded-lg shadow-md">
              <p className="text-4xl font-bold mb-2">35+</p>
              <p className="text-lg">Cities Served</p>
            </div>
          </div>
        </div>
        
        {/* Join Us CTA */}
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Growing Team</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Are you a skilled professional looking to grow your business? Join our network of trusted 
            service providers and connect with customers in your area.
          </p>
          <a href="/apply" className="inline-block bg-blue-700 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-800 transition-colors">
            Apply as a Service Pro
          </a>
        </div>
        
        {/* Bottom Back to Home */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center text-blue-700 hover:text-blue-800 transition-colors text-lg font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;