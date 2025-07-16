import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
// Add framer-motion import
import { motion } from 'framer-motion';

const CostEstimationSummary = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUserData();
  const [costEstimate, setCostEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  const calculateCostEstimate = useCallback(() => {
    const { userData, selectedProvider } = state;
    
    // Simple fallback cost estimate since we don't have real insurance data
    const basePrice = 150; // Default office visit cost
    const coveragePercentage = 0.8; // 80% coverage
    const coveredAmount = basePrice * coveragePercentage;
    const outOfPocketCost = basePrice - coveredAmount;

    return {
      cptCode: '99213',
      cptDescription: 'Office visit - established patient',
      basePrice,
      coveragePercentage: coveragePercentage * 100,
      coveredAmount,
      outOfPocketCost,
      insurance: userData?.insuranceProvider || 'Standard Plan',
      provider: selectedProvider
    };
  }, [state]);

  useEffect(() => {
    const estimate = calculateCostEstimate();
    if (estimate) {
      setCostEstimate(estimate);
      dispatch({ type: 'SET_COST_ESTIMATE', payload: estimate });
    }
    setLoading(false);
  }, [calculateCostEstimate]);

  const handleContinue = () => {
    navigate('/summary');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 6, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Box sx={{ width: 80, height: 80, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', fontWeight: 'bold', boxShadow: 3, mx: 'auto', mb: 4, position: 'relative', overflow: 'hidden', animation: 'pulse 2s infinite' }}>
            <span style={{ fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>💰</span>
          </Box>
          <Typography variant="h5" sx={{ color: '#333', mb: 2, fontWeight: 700 }}>Calculating your cost estimate...</Typography>
          <Typography sx={{ color: '#666', mb: 3 }}>Analyzing your insurance coverage and provider rates</Typography>
          <Box sx={{ width: 40, height: 4, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 1, mx: 'auto', animation: 'loading 1.5s ease-in-out infinite' }} />
          <style>{`
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes loading { 0% { width: 40px; } 50% { width: 120px; } 100% { width: 40px; } }
          `}</style>
        </Paper>
      </Box>
    );
  }

  if (!costEstimate) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 5, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Box sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', fontWeight: 'bold', boxShadow: 3, mx: 'auto', mb: 3 }}>
            ⚠️
          </Box>
          <Typography variant="h6" sx={{ color: '#333', mb: 2, fontWeight: 700 }}>Unable to calculate cost estimate</Typography>
          <Typography sx={{ color: '#666', mb: 3 }}>We couldn't determine your cost estimate. Please check your insurance information.</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/intake')}>
            Update Insurance Info
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3 }}>
      <motion.div
        initial={{ scale: 0.7, y: 100, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12, duration: 0.8 }}
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 5, maxWidth: 800, mx: 'auto', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Typography variant="h4" sx={{ mb: 4, color: '#333', fontWeight: 700 }}>Cost Estimate Summary</Typography>
          <Paper sx={{ background: '#f8f9fa', p: 3, borderRadius: 2, mb: 4 }} elevation={0}>
            <Typography variant="h6" sx={{ mb: 2 }}>Appointment Details</Typography>
            <Typography><strong>Provider:</strong> {costEstimate.provider.name}</Typography>
            <Typography><strong>Specialty:</strong> {costEstimate.provider.specialty}</Typography>
            <Typography><strong>Insurance:</strong> {costEstimate.insurance}</Typography>
          </Paper>
          <Box mb={4}>
            <Typography variant="h5" sx={{ mb: 3, color: '#333' }}>Cost Breakdown</Typography>
            <Paper sx={{ border: '2px solid #e1e5e9', borderRadius: 3, p: 3, background: 'white' }} elevation={0}>
              <Grid container spacing={3} mb={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>CPT Code</Typography>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{costEstimate.cptCode}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Service Description</Typography>
                  <Typography>{costEstimate.cptDescription}</Typography>
                </Grid>
              </Grid>
              <Box sx={{ borderTop: '1px solid #e1e5e9', pt: 3, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography>Base Price:</Typography>
                  <Typography fontWeight={700}>${costEstimate.basePrice}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography>Insurance Coverage ({costEstimate.coveragePercentage}%):</Typography>
                  <Typography sx={{ color: '#28a745', fontWeight: 700 }}>-${costEstimate.coveredAmount.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" pt={2} borderTop="2px solid #e1e5e9" fontSize="1.2rem" fontWeight={700} color="#dc3545">
                  <Typography>Your Cost:</Typography>
                  <Typography>${costEstimate.outOfPocketCost.toFixed(2)}</Typography>
                </Stack>
              </Box>
            </Paper>
          </Box>
          <Paper sx={{ background: '#e8f5e8', p: 2, borderRadius: 2, mb: 4, border: '1px solid #28a745' }} elevation={0}>
            <Typography variant="h6" sx={{ color: '#155724', mb: 1 }}>💡 Cost Savings Tip</Typography>
            <Typography sx={{ color: '#155724', m: 0 }}>
              Your insurance covers {costEstimate.coveragePercentage}% of this visit. This is a typical coverage rate for {costEstimate.insurance} plans.
            </Typography>
          </Paper>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={4}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/provider/${costEstimate.provider._id}`)}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Back to Provider
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue}
              sx={{ borderRadius: 2, fontWeight: 600, flex: 1 }}
            >
              Continue to Care Summary
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default CostEstimationSummary; 