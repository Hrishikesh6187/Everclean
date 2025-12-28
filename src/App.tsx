import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import Home from './components/Home'
import ApplyForm from './components/ApplyForm'
import Services from './components/Services'
import UploadDocuments from './components/UploadDocument'
import FreelancerApplication from './components/FreelancerApplication'
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './components/Profile';
import BookServices from './components/BookServices';
import FreelancerDashboard from './components/freelancerDashboard';
import FreelancerProfile from './components/FreelancerProfile';
import UpcomingJobs from './components/UpcomingJobs';
import AdminDashboard from './components/AdminDashboard'
import BookingHistory from './components/BookingHistory';
import RateService from './components/RateService';
import AboutUs from './components/AboutUs';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  const isHomePage = location.pathname === '/' || location.pathname === '/home'
  const showNavbarFooter = isHomePage || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/apply'

  return (
    <>
      {showNavbarFooter && <Navbar />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/apply" element={<ApplyForm />} />
          <Route path="/services" element={<Services />} />
          <Route path="/freelancer-application" element={<FreelancerApplication />} />
          <Route path="/uploadDocuments" element={<UploadDocuments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/freelancer-profile" element={<FreelancerProfile />} />
          <Route path="/book-services" element={<BookServices />} />
          <Route path="/upcoming-jobs" element={<UpcomingJobs />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/rate-service" element={<RateService />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/freelancer-dashboard"
            element={
              isAuthenticated ? (
                <FreelancerDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              isAuthenticated ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
      {showNavbarFooter && <Footer />}
    </>
  )
}

export default App