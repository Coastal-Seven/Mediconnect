import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { motion } from 'framer-motion';

const DELIMITER = '---SECTION---';

const AIGeneratedCareSummary = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUserData();
  const { userData, selectedProvider, costEstimate } = state;
  const [aiSections, setAiSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Compose the payload for the AI backend
  const buildPayload = () => {
    return {
      patient: {
        name: userData.name,
        symptoms: userData.primarySymptoms,
        duration: userData.duration,
        urgencyLevel: userData.urgencyLevel,
        severity: userData.severity,
        description: userData.detailedDescription,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        pincode: userData.pincode,
        insuranceProvider: userData.insuranceProvider,
        insurancePlan: userData.insurancePlan,
        memberId: userData.memberId
      },
      provider: selectedProvider,
      appointment: {
        date: costEstimate?.appointment_time,
        cost: costEstimate?.outOfPocketCost,
        basePrice: costEstimate?.basePrice,
        insuranceCoverage: costEstimate?.coveredAmount
      }
    };
  };

  // Compose the prompt for the AI
  const buildPrompt = (payload) => {
    return (
      `PATIENT INFO:\n` +
      `Name: ${payload.patient.name}\n` +
      `Symptoms: ${payload.patient.symptoms}\n` +
      `Duration: ${payload.patient.duration}\n` +
      `Urgency: ${payload.patient.urgencyLevel}\n` +
      `Severity: ${payload.patient.severity}\n` +
      `Description: ${payload.patient.description}\n` +
      `Location: ${payload.patient.address}, ${payload.patient.city}, ${payload.patient.state}, ${payload.patient.pincode}\n` +
      `Insurance: ${payload.patient.insuranceProvider} - ${payload.patient.insurancePlan}\n` +
      `\nPROVIDER INFO:\n` +
      `Name: ${payload.provider.name}\n` +
      `Specialty: ${payload.provider.specialty}\n` +
      `Experience: ${payload.provider.experience}\n` +
      `Education: ${payload.provider.education}\n` +
      `Rating: ${payload.provider.rating}\n` +
      `Wait Time: ${payload.provider.wait_time}\n` +
      `Address: ${payload.provider.address}\n` +
      `Accepted Insurances: ${(payload.provider.accepted_insurances || []).join(', ')}\n` +
      `\nAPPOINTMENT INFO:\n` +
      `Date: ${payload.appointment.date}\n` +
      `Base Price: $${payload.appointment.basePrice}\n` +
      `Insurance Coverage: $${payload.appointment.insuranceCoverage}\n` +
      `Final Cost: $${payload.appointment.cost}\n` +
      `\n---\n` +
      `Based on all the above information, provide the following sections separated by the delimiter '${DELIMITER}':\n` +
      `1. Why this provider is recommended for the patient.\n` +
      `2. What to expect during the visit.\n` +
      `3. Preparation tips for the patient.\n` +
      `Each section should be clear, friendly, and actionable.\n` +
      `Format:\nWhy this provider?${DELIMITER}What to expect?${DELIMITER}Preparation tips.`
    );
  };

  // Fetch AI summary on load or when relevant info changes
  useEffect(() => {
    let ignore = false;
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      setAiSections(null);
      try {
        const prompt = `
Given the following patient and provider information, answer in two sections:
1. Why is this provider suitable for the patient? (summary in 5-8 lines, clear and to the point)
2. What can the patient expect from the visit? (summary in 5-8 lines, clear and to the point)

PATIENT INFO:
Symptoms: ${userData.primarySymptoms}
Insurance: ${userData.insuranceProvider} - ${userData.insurancePlan}

PROVIDER INFO:
Name: ${selectedProvider.name}
Specialty: ${selectedProvider.specialty}
Accepted Insurances: ${(selectedProvider.accepted_insurances || []).join(', ')}
Experience: ${selectedProvider.experience}
Education: ${selectedProvider.education}
Rating: ${selectedProvider.rating}
Wait Time: ${selectedProvider.wait_time}
Address: ${selectedProvider.address}

Please answer in two sections, separated by '---SECTION---':
Section 1: Why this provider?
Section 2: What to expect?
Each section should be a concise summary of 5-8 lines, clear and to the point.`;
        const response = await fetch('http://localhost:8000/api/ai/gemini-care-tips/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_name: selectedProvider.name,
            specialty: selectedProvider.specialty,
            question: prompt
          })
        });
        if (!response.ok) {
          let errorMsg = 'Failed to generate summary.';
          try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        const parts = (data.tips || '').split('---SECTION---');
        setAiSections({
          why: parts[0]?.trim() || '',
          expect: parts[1]?.trim() || ''
        });
      } catch (err) {
        setError('Failed to generate summary. Please try again.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (selectedProvider && userData) {
      fetchSummary();
    }
    return () => { ignore = true; };
  }, [userData, selectedProvider]);

  const handleConfirmBooking = async () => {
    try {
      const user = state.user;
      if (!user || !user.id) {
        alert('Please login first');
        navigate('/login');
        return;
      }
      const bookingData = {
        user_id: user.id,
        provider_id: selectedProvider._id,
        appointment_time: costEstimate?.appointment_time || new Date().toISOString(),
        status: "confirmed",
        outOfPocketCost: costEstimate?.outOfPocketCost
      };
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
      dispatch({ type: 'SET_COST_ESTIMATE', payload: costEstimate });
      dispatch({ type: 'SET_BOOKING_DATA', payload: bookingData });
      const bookingsRes = await fetch(`http://127.0.0.1:8000/api/bookings/user/${user.id}`);
      if (bookingsRes.ok) {
        const bookings = await bookingsRes.json();
        dispatch({ type: 'SET_UPCOMING_APPOINTMENTS', payload: bookings });
      }
      navigate('/confirmation');
    } catch (error) {
      alert('Failed to confirm booking: ' + error.message);
    }
  };

  if (!selectedProvider || !costEstimate) {
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
            <Typography><strong>Provider:</strong> {selectedProvider?.name ?? ''}</Typography>
            <Typography><strong>Specialty:</strong> {selectedProvider?.specialty ?? ''}</Typography>
            <Typography><strong>Date:</strong> {costEstimate?.appointment_time ? new Date(costEstimate.appointment_time).toLocaleDateString() : ''}</Typography>
            <Typography><strong>Estimated Cost:</strong> ${costEstimate?.outOfPocketCost?.toFixed(2) ?? ''}</Typography>
          </Paper>
          <Typography variant="h5" sx={{ color: '#333', mb: 3 }}>🤖 AI Analysis</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Generating your care summary...</Typography>
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
          ) : aiSections ? (
            <>
              <Box mb={3}>
                <Typography variant="h6" sx={{ color: '#3366cc', mb: 1 }}>Why This Provider?</Typography>
                <Paper sx={{ background: '#e3f0ff', p: 2, borderRadius: 2, color: '#222' }} elevation={0}>
                  {aiSections?.why}
                </Paper>
              </Box>
              <Box mb={3}>
                <Typography variant="h6" sx={{ color: '#28a745', mb: 1 }}>What to Expect</Typography>
                <Paper sx={{ background: '#e8f5e9', p: 2, borderRadius: 2, color: '#222' }} elevation={0}>
                  {aiSections?.expect}
                </Paper>
              </Box>
            </>
          ) : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" mt={4}>
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