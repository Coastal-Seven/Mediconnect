import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
// Material UI imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
// Add framer-motion import
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUserData();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  console.log('DashboardPage rendered, user state:', state.user);

  useEffect(() => {
    console.log('DashboardPage useEffect triggered');
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      // Get user ID from context
      const user = state.user;
      if (!user || !user.id) {
        navigate('/login');
        return;
      }

      // Fetch user's bookings from backend
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });

      if (response.ok) {
        let bookings = await response.json();
        console.log('Raw bookings from backend:', bookings);
        // Show all confirmed bookings, regardless of date
        const filteredBookings = bookings.filter(b => b.status === "confirmed");
        console.log('Filtered bookings (confirmed & future):', filteredBookings);
        // Fetch provider details for each booking
        const enriched = await Promise.all(filteredBookings.map(async (booking) => {
          try {
            const providerRes = await fetch(`http://127.0.0.1:8000/api/providers/${booking.provider_id}`);
            if (providerRes.ok) {
              const provider = await providerRes.json();
              return {
                ...booking,
                providerName: provider.name,
                specialty: provider.specialty,
                location: provider.address,
                date: booking.appointment_time,
                time: new Date(booking.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
          } catch (e) {}
          // Fallback to saved data in booking
          return {
            ...booking,
            providerName: booking.provider_name || 'Unknown',
            specialty: booking.specialty || '',
            location: booking.location || '',
            date: booking.appointment_time,
            time: new Date(booking.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }));
        console.log('Enriched appointments to show:', enriched);
        setUpcomingAppointments(enriched);
      } else {
        setUpcomingAppointments([]);
      }
    } catch (error) {
      setUpcomingAppointments([]);
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const handleStartIntake = () => {
    navigate('/intake');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  // Always use the local enriched upcomingAppointments state for rendering
  const appointmentsToShow = upcomingAppointments;

  // Enrich appointments from context with provider details if needed
  useEffect(() => {
    const enrichAppointments = async () => {
      if (state.upcomingAppointments && state.upcomingAppointments.length > 0) {
        const enriched = await Promise.all(state.upcomingAppointments.map(async (booking) => {
          try {
            const providerRes = await fetch(`http://127.0.0.1:8000/api/providers/${booking.provider_id}`);
            if (providerRes.ok) {
              const provider = await providerRes.json();
              return {
                ...booking,
                providerName: provider.name,
                specialty: provider.specialty,
                location: provider.address,
                date: booking.appointment_time,
                time: new Date(booking.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
          } catch (e) {}
          return {
            ...booking,
            providerName: 'Unknown',
            specialty: '',
            location: '',
            date: booking.appointment_time,
            time: new Date(booking.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }));
        setUpcomingAppointments(enriched);
      }
    };
    enrichAppointments();
    // eslint-disable-next-line
  }, [state.upcomingAppointments]);

  // Add cancel and reschedule handlers
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/cancel/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        fetchUserBookings();
        alert('Appointment cancelled and deleted successfully.');
      } else {
        alert('Failed to cancel appointment.');
      }
    } catch (e) {
      alert('Error cancelling appointment.');
    }
  };

  const handleReschedule = async (bookingId) => {
    const date = window.prompt('Enter new date (YYYY-MM-DD):');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      alert('Invalid date format. Please use YYYY-MM-DD.');
      return;
    }
    const time = window.prompt('Enter new time (HH:MM, 24-hour):');
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      alert('Invalid time format. Please use HH:MM (24-hour).');
      return;
    }
    const newTime = `${date}T${time}:00`;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/reschedule/${bookingId}?new_time=${encodeURIComponent(newTime)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        fetchUserBookings();
      } else {
        alert('Failed to reschedule appointment.');
      }
    } catch (e) {
      alert('Error rescheduling appointment.');
    }
  };

  if (!state.user) {
    console.log('No user found in state, redirecting to login');
    console.log('Current state:', state);
    navigate('/login');
    return null;
  }

  console.log('Dashboard rendering with user:', state.user);

  return (
    <motion.div
      initial={{ x: '100vw', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100vw', opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      style={{ minHeight: '100vh', background: '#f8f9fa' }}
    >
      <Box sx={{ minHeight: '100vh', background: 'inherit' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: 3 }} elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', px: 5 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ width: 45, height: 45, bgcolor: 'primary.main', fontSize: 24, fontWeight: 'bold', boxShadow: 3 }}>
              ⚕️
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.5px', m: 0 }}>
                MediConnect
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>
                Healthcare Simplified
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography sx={{ fontSize: 14 }}>
              Welcome, {state.user ? state.user.name : 'User'}!
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              sx={{ borderRadius: '20px', fontWeight: 500 }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Welcome Section */}
        <Paper elevation={3} sx={{ borderRadius: 3, p: 4, mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ color: '#333', mb: 1, fontWeight: 700 }}>
                Welcome back, {state.user ? state.user.name : 'User'}! 👋
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                Manage your healthcare appointments and find the best providers for your needs.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="success"
              onClick={handleStartIntake}
              sx={{ borderRadius: '25px', fontWeight: 600, px: 4, py: 1.5 }}
            >
              Find Healthcare Provider
            </Button>
          </Stack>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ borderRadius: 3, p: 3, borderLeft: '4px solid #4CAF50' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e8f5e8', color: 'black', fontSize: 24 }}>📅</Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: '#333', fontWeight: 700 }}>{appointmentsToShow.length}</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>Upcoming Appointments</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ borderRadius: 3, p: 3, borderLeft: '4px solid #2196F3' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e3f2fd', color: 'black', fontSize: 24 }}>🏥</Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: '#333', fontWeight: 700 }}>15+</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>Available Providers</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ borderRadius: 3, p: 3, borderLeft: '4px solid #FF9800' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: '#fff3e0', color: 'black', fontSize: 24 }}>💰</Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: '#333', fontWeight: 700 }}>$10</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>Estimated Savings</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Upcoming Appointments */}
        <Paper elevation={3} sx={{ borderRadius: 3, p: 4 }}>
          <Typography variant="h6" sx={{ color: '#333', mb: 3 }}>
            Upcoming Appointments
          </Typography>
          {appointmentsToShow.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, color: '#666' }}>
              <Typography variant="h1" sx={{ fontSize: 48, mb: 2 }}>📅</Typography>
              <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>No upcoming appointments</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Start by finding a healthcare provider that matches your needs.
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleStartIntake}
                sx={{ borderRadius: '20px', fontWeight: 500, px: 3, py: 1 }}
              >
                Book Appointment
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {appointmentsToShow.map(appointment => (
                <Paper key={appointment._id || appointment.id} elevation={1} sx={{ border: '1px solid #e9ecef', borderRadius: 2, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 700, mb: 0.5 }}>
                      {appointment.providerName !== 'Unknown'
                        ? appointment.providerName
                        : <span style={{ color: 'red' }} title="This provider may have been removed or is temporarily unavailable.">Provider info unavailable</span>}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>{appointment.specialty}</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      📍 {appointment.location ? appointment.location : <span style={{ color: 'red' }}>Location unavailable</span>}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>{formatDate(appointment.date)}</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>{appointment.time}</Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
      </Box>
    </motion.div>
  );
};

export default DashboardPage; 