import { Link } from 'react-router-dom';
import { PaintRoller, Leaf, Brush, Droplets, Home, Wrench, Zap, Sparkles } from 'lucide-react';

export default function Services() {
  const services = [
    { name: "Landscaping", icon: Leaf, description: "Professional gardening services to keep your outdoor space beautiful." },
    { name: "Pressure Washing", icon: Droplets, description: "High-powered cleaning for driveways, patios, and more." },
    { name: "Indoor Cleaning", icon: Brush, description: "Deep indoor cleaning services for a fresh, spotless home." },
    { name: "Gutter Cleaning", icon: Home, description: "Expert gutter cleaning to protect your home from water damage." },
    { name: "House Painting", icon: PaintRoller, description: "Professional painting services for both interiors and exteriors." },
    { name: "House Cleaning", icon: Sparkles, description: "Thorough house cleaning services for a spotless and healthy home environment." },
    { name: "Plumbing", icon: Wrench, description: "Expert plumbing services for repairs, installations, and maintenance." },
    { name: "Electrical", icon: Zap, description: "Professional electrical services for all your home electrical needs." },
    { name: "Handyman", icon: Wrench, description: "Skilled handyman services for various home repairs and improvements." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-indigo-600">Our Services</h1>
        <p className="mt-4 text-lg text-gray-700">
          We offer top-quality home services to make your life easier.
        </p>
      </div>

      {/* Service Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-lg shadow-lg p-8 rounded-xl text-center border border-gray-300 hover:shadow-xl transition duration-300"
          >
            <div className="text-indigo-600 mb-4">
              <service.icon size={40} />  {/* This properly renders the icon */}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">{service.name}</h3>
            <p className="mt-2 text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>

      {/* Back to Home Button */}
      <div className="mt-12 text-center">
        <Link
          to="/"
          className="px-6 py-3 text-lg font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
