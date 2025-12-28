import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Ever Clean Home Servicing</h3>
            <p className="text-blue-200 mb-4">
              Your trusted partner for all home service needs. Quality service guaranteed.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/book-services" state={{ selectedService: "Cleaning", fromSearch: true }} className="text-blue-200 hover:text-white">Cleaning</Link></li>
              <li><Link to="/book-services" state={{ selectedService: "Plumbing", fromSearch: true }} className="text-blue-200 hover:text-white">Plumbing</Link></li>
              <li><Link to="/book-services" state={{ selectedService: "Electrical", fromSearch: true }} className="text-blue-200 hover:text-white">Electrical</Link></li>
              <li><Link to="/book-services" state={{ selectedService: "Landscaping", fromSearch: true }} className="text-blue-200 hover:text-white">Landscaping</Link></li>
              <li><Link to="/book-services" state={{ selectedService: "Painting", fromSearch: true }} className="text-blue-200 hover:text-white">Painting</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about-us" className="text-blue-200 hover:text-white">About Us</Link></li>
              <li><Link to="/" className="text-blue-200 hover:text-white">How it Works</Link></li>
              <li><Link to="/apply" className="text-blue-200 hover:text-white">Join as Pro</Link></li>
              <li><Link to="/" className="text-blue-200 hover:text-white">Why Join Us?</Link></li>
              
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <MapPin size={18} className="mr-2 text-blue-300" />
                <span className="text-blue-200">123 Service St, Anytown, USA</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-blue-300" />
                <span className="text-blue-200">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-blue-300" />
                <span className="text-blue-200">info@everclean.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-700 mt-8 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-blue-200">© 2025 Ever Clean Home Servicing. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <Link to="/" className="text-blue-200 hover:text-white mr-4">Privacy Policy</Link>
            <Link to="/" className="text-blue-200 hover:text-white mr-4">Terms of Service</Link>
            <Link to="/" className="text-blue-200 hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;