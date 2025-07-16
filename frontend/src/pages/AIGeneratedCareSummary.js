import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
// Add framer-motion import
import { motion } from 'framer-motion';

const AIGeneratedCareSummary = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUserData();
  const [careSummary, setCareSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const generateCareSummary = useCallback(() => {
    const { userData, selectedProvider, costEstimate } = state;
    const { primarySymptoms, insuranceProvider } = userData;
    
    // Handle symptoms whether they come as array or string
    let symptomsText = '';
    if (Array.isArray(primarySymptoms)) {
      symptomsText = primarySymptoms.join(' ').toLowerCase();
    } else {
      symptomsText = primarySymptoms.toLowerCase();
    }
    
    // Generate AI-like summary based on symptoms and provider
    let whyThisProvider = '';
    let careExpectations = '';
    let preparationTips = '';

    if (symptomsText.includes('rash') || symptomsText.includes('skin')) {
      whyThisProvider = `${selectedProvider.name} is an excellent choice for your skin concerns. As a board-certified dermatologist with ${selectedProvider.experience} of experience, they specialize in diagnosing and treating various skin conditions. Their high rating of ${selectedProvider.rating}/5 and short wait time of ${selectedProvider.wait_time} make them an ideal match for your needs.`;
      
      careExpectations = `During your visit, Dr. ${selectedProvider.name.split(' ')[1]} will conduct a thorough examination of your skin condition. They may take photographs for documentation, perform a skin biopsy if necessary, and discuss treatment options. The appointment typically lasts 20-30 minutes, and you'll receive a detailed treatment plan.`;
      
      preparationTips = `Before your appointment: 1) Avoid applying any creams or makeup to the affected area, 2) Bring a list of any medications you're currently taking, 3) Wear loose-fitting clothing that allows easy access to the affected area, 4) Consider taking photos of your condition if it changes before the appointment.`;
    } else if (symptomsText.includes('chest pain')) {
      whyThisProvider = `${selectedProvider.name} is highly qualified to address your cardiac concerns. As a cardiologist with ${selectedProvider.experience} of experience and training from ${selectedProvider.education}, they have extensive expertise in evaluating chest pain and related symptoms. Their excellent rating and quick availability ensure you'll receive prompt, quality care.`;
      
      careExpectations = `Your cardiology consultation will include a comprehensive medical history review, physical examination, and potentially diagnostic tests like an EKG or stress test. Dr. ${selectedProvider.name.split(' ')[1]} will assess your symptoms and develop a personalized treatment plan. The visit typically takes 45-60 minutes.`;
      
      preparationTips = `Before your appointment: 1) Bring a list of all current medications and dosages, 2) Wear comfortable clothing that allows easy access for examination, 3) Avoid eating or drinking for 2-3 hours before if tests are scheduled, 4) Bring any previous cardiac test results or medical records.`;
    } else {
      whyThisProvider = `${selectedProvider.name} is well-suited to address your health concerns. With ${selectedProvider.experience} of experience in ${selectedProvider.specialty.toLowerCase()}, they have the expertise to properly diagnose and treat your symptoms. Their high patient satisfaction rating and convenient location make them an excellent choice for your care.`;
      
      careExpectations = `Your appointment will begin with a comprehensive review of your symptoms and medical history. Dr. ${selectedProvider.name.split(' ')[1]} will perform a physical examination and may order diagnostic tests if needed. You'll receive a clear diagnosis and treatment plan tailored to your specific needs.`;
      
      preparationTips = `Before your appointment: 1) Write down your symptoms and when they started, 2) Bring a list of all medications and supplements, 3) Wear comfortable clothing, 4) Arrive 15 minutes early to complete any necessary paperwork.`;
    }

    return {
      whyThisProvider,
      careExpectations,
      preparationTips,
      provider: selectedProvider,
      costEstimate,
      symptoms: primarySymptoms,
      insurance: insuranceProvider
    };
  }, [state]);

  useEffect(() => {
    const summary = generateCareSummary();
    if (summary) {
      setCareSummary(summary);
    }
    setLoading(false);
  }, [generateCareSummary]);

  const handleConfirmBooking = async () => {
    try {
      // Get user ID from context
      const user = state.user;
      if (!user || !user.id) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      // Update the booking status to confirmed
      const bookingData = {
        user_id: user.id,
        provider_id: careSummary.provider._id,
        appointment_time: careSummary.costEstimate?.appointment_time || new Date().toISOString(),
        status: "confirmed",
        outOfPocketCost: careSummary.costEstimate?.outOfPocketCost // Add this line
      };

      // Real API call to update booking status
      const response = await fetch('http://127.0.0.1:8000/api/bookings/confirm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to confirm booking');
      }

      const result = await response.json();
      console.log('Booking confirmed successfully:', result);

      // Save cost estimate and booking data to context before navigating
      dispatch({ type: 'SET_COST_ESTIMATE', payload: careSummary.costEstimate });
      dispatch({ type: 'SET_BOOKING_DATA', payload: bookingData });

      // Fetch latest bookings and update context for dashboard
      const bookingsRes = await fetch(`http://127.0.0.1:8000/api/bookings/user/${user.id}`);
      if (bookingsRes.ok) {
        const bookings = await bookingsRes.json();
        dispatch({ type: 'SET_UPCOMING_APPOINTMENTS', payload: bookings });
      }

      // Navigate to confirmation page
      navigate('/confirmation');
      
    } catch (error) {
      console.error('Booking confirmation error:', error);
      alert('Failed to confirm booking: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 6, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Box sx={{ width: 80, height: 80, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', fontWeight: 'bold', boxShadow: 3, mx: 'auto', mb: 4, position: 'relative', overflow: 'hidden', animation: 'pulse 2s infinite' }}>
            <span style={{ fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🤖</span>
          </Box>
          <Typography variant="h5" sx={{ color: '#333', mb: 2, fontWeight: 700 }}>Generating your personalized care summary...</Typography>
          <Typography sx={{ color: '#666', mb: 3 }}>Our AI is analyzing your symptoms and provider match</Typography>
          <Box sx={{ width: 40, height: 4, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 1, mx: 'auto', animation: 'loading 1.5s ease-in-out infinite' }} />
          <style>{`
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes loading { 0% { width: 40px; } 50% { width: 120px; } 100% { width: 40px; } }
          `}</style>
        </Paper>
      </Box>
    );
  }

  if (!careSummary) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 5, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Box sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', fontWeight: 'bold', boxShadow: 3, mx: 'auto', mb: 3 }}>
            ⚠️
          </Box>
          <Typography variant="h6" sx={{ color: '#333', mb: 2, fontWeight: 700 }}>Unable to generate care summary</Typography>
          <Typography sx={{ color: '#666', mb: 3 }}>We couldn't create your personalized care summary. Please try again.</Typography>
          <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!careSummary || !careSummary.provider || !careSummary.costEstimate) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 5, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Box sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', fontWeight: 'bold', boxShadow: 3, mx: 'auto', mb: 3 }}>
            ⚠️
          </Box>
          <Typography variant="h6" sx={{ color: '#333', mb: 2, fontWeight: 700 }}>Missing or invalid care summary data</Typography>
          <Typography sx={{ color: '#666', mb: 3 }}>We couldn't load your personalized care summary. Please return to the previous step and try again.</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/cost-estimate')}>
            Back to Estimate
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 5, maxWidth: 800, mx: 'auto', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Typography variant="h4" sx={{ mb: 4, color: '#333', fontWeight: 700 }}>Your Personalized Care Summary</Typography>
          <Paper sx={{ background: '#f8f9fa', p: 3, borderRadius: 2, mb: 4 }} elevation={0}>
            <Typography variant="h6" sx={{ mb: 2 }}>Appointment Overview</Typography>
            <Typography><strong>Provider:</strong> {careSummary.provider?.name ?? ''}</Typography>
            <Typography><strong>Specialty:</strong> {careSummary.provider?.specialty ?? ''}</Typography>
            <Typography><strong>Date:</strong> {careSummary.costEstimate?.appointment_time ? new Date(careSummary.costEstimate.appointment_time).toLocaleDateString() : ''}</Typography>
            <Typography><strong>Estimated Cost:</strong> ${careSummary.costEstimate?.outOfPocketCost?.toFixed(2) ?? ''}</Typography>
          </Paper>
          <Typography variant="h5" sx={{ color: '#333', mb: 3 }}>🤖 AI Analysis</Typography>
          <Box mb={3}>
            <Typography variant="h6" sx={{ color: '#3366cc', mb: 1 }}>Why This Provider?</Typography>
            <Paper sx={{ background: '#e3f0ff', p: 2, borderRadius: 2, color: '#222' }} elevation={0}>
              {careSummary.whyThisProvider}
            </Paper>
          </Box>
          <Box mb={3}>
            <Typography variant="h6" sx={{ color: '#28a745', mb: 1 }}>What to Expect</Typography>
            <Paper sx={{ background: '#e8f5e9', p: 2, borderRadius: 2, color: '#222' }} elevation={0}>
              {careSummary.careExpectations}
            </Paper>
          </Box>
          <Box mb={4}>
            <Typography variant="h6" sx={{ color: '#ff9800', mb: 1 }}>Preparation Tips</Typography>
            <Paper sx={{ background: '#fff8e1', p: 2, borderRadius: 2, color: '#222' }} elevation={0}>
              {careSummary.preparationTips}
            </Paper>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/cost-estimate')}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Back to Estimate
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmBooking}
              sx={{ borderRadius: 2, fontWeight: 600, flex: 1 }}
            >
              Confirm & Book
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default AIGeneratedCareSummary; 