import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Search, Briefcase, MessageSquare, Bell, User } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Home className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">Ever Clean Home Servicing</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-blue-200">
                Home
              </Link>
              <Link to="/services" className="inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-blue-200">
                Services
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="ml-3 relative">
              <div>
                <Link to="/login" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium mr-2">
                  Login
                </Link>
                <Link to="/signup" className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block pl-3 pr-4 py-2 text-base font-medium hover:bg-blue-500">
              Home
            </Link>
            <Link to="/services" className="block pl-3 pr-4 py-2 text-base font-medium hover:bg-blue-500">
              Services
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-blue-500">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 rounded-full bg-blue-500 p-2" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">Account</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link to="/login" className="block px-4 py-2 text-base font-medium hover:bg-blue-500">
                Login
              </Link>
              <Link to="/signup" className="block px-4 py-2 text-base font-medium hover:bg-blue-500">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;