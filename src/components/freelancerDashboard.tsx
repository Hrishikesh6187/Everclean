'use client';

import React, { useEffect, useState } from 'react';
import { Card, Grid, Typography, Box, Avatar, CircularProgress } from '@mui/material';
import {
  WorkHistory,
  AttachMoney,
  Star,
  Schedule,
  CalendarMonth,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Edit, CalendarToday, Logout } from '@mui/icons-material';
import FreelancerPosts from './FreelancerPosts';

/**
 * npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
 * npm install @supabase/supabase-js @heroicons/react @supabase/auth-helpers-nextjs
 */

interface DashboardStats {
  total_jobs_completed: number;
  total_earnings: number;
  average_rating: number;
  total_hours_worked: number;
  current_month_earnings: number;
  current_month_jobs: number;
  upcoming_jobs: number;
}

interface FreelancerProfile {
  first_name: string;
  last_name: string;
  profile_photo: string;
  hourly_pay: number;
}

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch freelancer profile and stats in parallel
        const [profileResponse, statsResponse] = await Promise.all([
          supabase
            .from('approved_freelancers')
            .select(`
              *,
              freelancer_info:freelancer_applications(
                first_name,
                last_name
              )
            `)
            .eq('freelancer_id', user.id)
            .single(),
          
          supabase
            .from('freelancer_dashboard_stats')
            .select('*')
            .eq('freelancer_id', user.id)
            .single()
        ]);

        if (profileResponse.error) throw profileResponse.error;
        if (statsResponse.error) throw statsResponse.error;

        // Set profile data
        if (profileResponse.data) {
          setProfile({
            first_name: profileResponse.data.freelancer_info.first_name,
            last_name: profileResponse.data.freelancer_info.last_name,
            profile_photo: profileResponse.data.profile_photo || '',
            hourly_pay: profileResponse.data.hourly_pay
          });
        }

        // Set stats
        if (statsResponse.data) {
          setStats({
            total_jobs_completed: statsResponse.data.total_jobs_completed,
            total_earnings: statsResponse.data.total_earnings,
            average_rating: statsResponse.data.average_rating,
            total_hours_worked: statsResponse.data.total_hours_worked,
            current_month_earnings: statsResponse.data.current_month_earnings,
            current_month_jobs: statsResponse.data.current_month_jobs,
            upcoming_jobs: statsResponse.data.upcoming_jobs
          });
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const StatusCard = ({ 
    icon,
    title, 
    value,
    color
  }: { 
    icon: React.ReactNode;
    title: string; 
    value: string | number;
    color: string;
  }) => (
    <Card sx={{ 
      p: 3,
      height: '100%',
      backgroundColor: color,
      color: 'white',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 500 }}>
            {value}
          </Typography>
          <Typography variant="subtitle1">
            {title}
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={profile?.profile_photo}
            sx={{ width: 80, height: 80 }}
          />
          <Box>
            <Typography variant="h4">
              Welcome, {profile?.first_name} {profile?.last_name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Hourly Rate: ${profile?.hourly_pay}/hr
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate('/freelancer-profile')}
          >
            Update Profile
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<CalendarToday />}
          onClick={() => navigate('/upcoming-jobs')}
          sx={{ 
            mr: 2,
            backgroundColor: '#6366f1', // indigo color
            '&:hover': {
              backgroundColor: '#4f46e5'
            }
          }}
        >
          Manage Upcoming Jobs
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatusCard
            icon={<WorkHistory sx={{ color: 'white' }} />}
            title="Total Jobs"
            value={stats?.total_jobs_completed || 0}
            color="#f59e0b" // amber
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatusCard
            icon={<AttachMoney sx={{ color: 'white' }} />}
            title="Total Earnings"
            value={`$${stats?.total_earnings || 0}`}
            color="#0ea5e9" // sky blue
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatusCard
            icon={<Star sx={{ color: 'white' }} />}
            title="Average Rating"
            value={`${stats?.average_rating || 0}/5`}
            color="#10b981" // emerald
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatusCard
            icon={<Schedule sx={{ color: 'white' }} />}
            title="Hours Worked"
            value={`${stats?.total_hours_worked || 0}hrs`}
            color="#8b5cf6" // purple
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatusCard
            icon={<AttachMoney sx={{ color: 'white' }} />}
            title="This Month"
            value={`$${stats?.current_month_earnings || 0}`}
            color="#ec4899" // pink
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatusCard
            icon={<CalendarMonth sx={{ color: 'white' }} />}
            title="Upcoming Jobs"
            value={stats?.upcoming_jobs || 0}
            color="#6366f1" // indigo
          />
        </Grid>
      </Grid>
      {/* Social Feed Section */}
      <Box sx={{ mt: 6 }}>
    <Card sx={{ 
      border: '2px solid #6366f1',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s',
      '&:hover': {
        transform: 'translateY(-2px)'
      }
    }}>
      <FreelancerPosts />
    </Card>
  </Box>    
    </Box>
  );
}