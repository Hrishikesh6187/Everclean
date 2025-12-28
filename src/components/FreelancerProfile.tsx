import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Avatar,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { supabase } from '../lib/supabase';
import { Alert, Snackbar } from '@mui/material';

// Add this after the imports
const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  '&.selected': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  }
}));

interface FreelancerProfileData {
  hourly_pay: number;
  start_time: string;
  end_time: string;
  service_days: string[];
  profile_photo: string[];
}

export default function FreelancerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<FreelancerProfileData>({
    hourly_pay: 0,
    start_time: '09:00',
    end_time: '17:00',
    service_days: [],
    profile_photo: []
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please login to access this page');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('approved_freelancers')
        .select('*')
        .eq('freelancer_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          hourly_pay: data.hourly_pay || 0,
          start_time: data.start_time || '09:00',
          end_time: data.end_time || '17:00',
          service_days: data.service_days || [],
          profile_photo: data.profile_photo || []
        });
      } else {
        setError('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (profileData.hourly_pay <= 0) {
      setError('Hourly rate must be greater than 0');
      setSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let profilePhotoUrls = [...profileData.profile_photo];

      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, profileImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        profilePhotoUrls = [publicUrl];
      }

      const { data, error: updateError } = await supabase
        .from('approved_freelancers')
        .update({
          hourly_pay: profileData.hourly_pay,
          start_time: profileData.start_time,
          end_time: profileData.end_time,
          service_days: profileData.service_days,
          profile_photo: profilePhotoUrls,
          updated_at: new Date().toISOString()
        })
        .eq('freelancer_id', user.id)
        .select();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Updated data:', data);

      await fetchProfileData();

      setSuccess(true);
      setTimeout(() => {
        navigate('/freelancer-dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
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
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Update Profile</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profileData.profile_photo?.[0] || ''}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <input
                accept="image/*"
                type="file"
                id="profile-photo"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-photo">
                <Button variant="outlined" component="span">
                  Change Photo
                </Button>
              </label>
            </Box>
          </Grid>
  
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Hourly Rate ($)"
              type="number"
              value={profileData.hourly_pay}
              onChange={(e) => setProfileData({ ...profileData, hourly_pay: Number(e.target.value) })}
            />
          </Grid>
  
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={profileData.start_time}
              onChange={(e) => setProfileData({ ...profileData, start_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
          </Grid>
  
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Time"
              type="time"
              value={profileData.end_time}
              onChange={(e) => setProfileData({ ...profileData, end_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
          </Grid>
  
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="service-days-label">Service Days</InputLabel>
              <Select
                labelId="service-days-label"
                multiple
                value={profileData.service_days}
                onChange={(e) => setProfileData({
                  ...profileData,
                  service_days: typeof e.target.value === 'string'
                    ? e.target.value.split(',')
                    : e.target.value
                })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <StyledChip
                        key={value}
                        label={value}
                        className="selected"
                        size="small"
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  minHeight: '56px',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    minHeight: '56px'
                  }
                }}
              >
                {weekDays.map((day) => (
                  <MenuItem 
                    key={day} 
                    value={day}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: 'primary.light',
                      }
                    }}
                  >
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
  
          <Grid item xs={12} display="flex" gap={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={() => navigate('/freelancer-dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </form>
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}