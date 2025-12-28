import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { CalendarToday, AccessTime, LocationOn, Person } from '@mui/icons-material';

interface UpcomingJob {
  booking_id: string;
  booking_date: string;
  booking_time: string;
  service_address: string;
  status: string;
  total_estimate: number;
  service_type: string[];
  first_name: string;
  last_name: string;
  special_instructions?: string;
  hourly_rate: number;
  estimated_duration: string;
}

export default function UpcomingJobs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<UpcomingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<UpcomingJob | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUpcomingJobs();
  }, []);

  const fetchUpcomingJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: freelancerData, error: freelancerError } = await supabase
        .from('approved_freelancers')
        .select('freelancer_id')
        .eq('freelancer_id', user.id)
        .single();

      if (freelancerError) {
        console.error('Error fetching freelancer:', freelancerError);
        return;
      }

      const { data, error } = await supabase
        .from('service_bookings')
        .select('*')
        .eq('freelancer_id', freelancerData?.freelancer_id || '')
        .in('status', ['pending', 'accepted', 'Payment Pending'])
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .order('booking_date', { ascending: true });

      if (error) throw error;

      if (data) {
        setJobs(data.map(job => ({
          ...job,
          client_name: `${job.first_name} ${job.last_name}`
        })));
      }
    } catch (error) {
      console.error('Error fetching upcoming jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const dbStatus = newStatus === 'declined' ? 'cancelled' : newStatus;
      
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: dbStatus })
        .eq('booking_id', bookingId);
  
      if (error) throw error;
  
      await fetchUpcomingJobs();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Upcoming Jobs</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/freelancer-dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Grid container spacing={3}>
        {jobs.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" color="text.secondary" textAlign="center">
              No upcoming jobs found
            </Typography>
          </Grid>
        ) : (
          jobs.map((job) => (
            <Grid item xs={12} md={6} key={job.booking_id}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{job.service_type.join(', ')}</Typography>
                    <Chip
                      label={job.status}
                      color={job.status === 'pending' ? 'warning' : 'success'}
                    />
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" />
                      <Typography>{new Date(job.booking_date).toLocaleDateString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" />
                      <Typography>{job.booking_time}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" />
                      <Typography>{job.service_address}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" />
                      <Typography>{`${job.first_name} ${job.last_name}`}</Typography>
                    </Box>
                    {job.special_instructions && (
                      <Typography variant="body2" color="text.secondary">
                        Special Instructions: {job.special_instructions}
                      </Typography>
                    )}
                  </Stack>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ${job.total_estimate || (job.hourly_rate * 2)}
                    </Typography>
                    <Box>
                      {(job.status === 'completed' || job.status === 'accepted') && (
                        <Button
                          variant="contained"
                          color="success"
                          sx={{ mr: 1 }}
                          onClick={() => handleStatusUpdate(job.booking_id, 'Payment Pending')}
                        >
                          Accept Payment
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        onClick={() => {
                          setSelectedJob(job);
                          setDialogOpen(true);
                        }}
                      >
                        Update Status
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Update Job Status</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to accept or decline this job?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedJob && handleStatusUpdate(selectedJob.booking_id, 'cancelled')}
            color="error"
          >
            Cancel Booking
          </Button>
          <Button 
            onClick={() => selectedJob && handleStatusUpdate(selectedJob.booking_id, 'accepted')}
            color="primary"
            variant="contained"
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}