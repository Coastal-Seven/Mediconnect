import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import { format } from 'date-fns';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
// Add framer-motion import
import { motion } from 'framer-motion';

const SuccessConfirmationPage = () => {
  const navigate = useNavigate();
  const { state } = useUserData();

  const handleStartOver = () => {
    navigate('/dashboard');
  };

  const handleViewBooking = () => {
    alert('Booking management feature would be implemented here');
  };

  if (!state.selectedProvider || !state.bookingData) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>No booking information found</Typography>
          <Typography gutterBottom>Please start over to book an appointment.</Typography>
          <Button variant="contained" color="primary" onClick={handleStartOver} sx={{ mt: 2 }}>
            Start Over
          </Button>
        </Paper>
      </Box>
    );
  }

  const appointmentDate = new Date(state.bookingData.appointment_time);
  const confirmationNumber = `CONF-${Date.now().toString().slice(-8)}`;
  const estimatedCost =
    state.costEstimate?.outOfPocketCost ??
    state.bookingData?.cost ??
    state.bookingData?.outOfPocketCost ??
    null;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 8 }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Paper elevation={4} sx={{ p: 5, textAlign: 'center' }}>
          <Box sx={{
            background: '#d4edda',
            color: '#155724',
            p: 2.5,
            borderRadius: '50%',
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            ✓
          </Box>
          <Typography variant="h4" sx={{ mb: 1, color: '#155724' }}>Booking Confirmed!</Typography>
          <Typography variant="subtitle1" sx={{ color: '#666', mb: 4 }}>
            Your appointment has been successfully scheduled
          </Typography>
          <Paper sx={{ background: '#f8f9fa', p: 3, borderRadius: 2, mb: 4, textAlign: 'left' }} elevation={0}>
            <Typography variant="h6" sx={{ mb: 3, color: '#333' }}>Appointment Details</Typography>
            <Grid container spacing={3} mb={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Confirmation Number</Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#007bff' }}>{confirmationNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Provider</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{state.selectedProvider.name}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={3} mb={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Date & Time</Typography>
                <Typography>{format(appointmentDate, 'EEEE, MMMM d, yyyy')}</Typography>
                <Typography>{format(appointmentDate, 'h:mm a')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Location</Typography>
                <Typography>{state.selectedProvider.address}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Specialty</Typography>
                <Typography>{state.selectedProvider.specialty}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Estimated Cost</Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#dc3545' }}>
                  {estimatedCost !== null ? `$${Number(estimatedCost).toFixed(2)}` : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ background: '#fff3cd', p: 2, borderRadius: 2, mb: 4, border: '1px solid #ffc107' }} elevation={0}>
            <Typography variant="h6" sx={{ color: '#856404', mb: 1 }}>📞 Need to Reschedule?</Typography>
            <Typography sx={{ color: '#856404', m: 0 }}>
              Call {state.selectedProvider.phone} or email {state.selectedProvider.email} at least 24 hours before your appointment.
            </Typography>
          </Paper>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" color="primary" onClick={handleStartOver}>
              Book Another Appointment
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default SuccessConfirmationPage; 