import React, { useState } from 'react';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// Add framer-motion import
import { motion } from 'framer-motion';

const AdminDevView = () => {
  const [activeTab, setActiveTab] = useState('providers');
  
  // Empty arrays since we're using real data from backend
  const providers = [];
  const insurance_plans = [];
  const cpt_codes = [];
  const bookings = [];

  const renderProviders = () => (
    <Box>
      <Typography variant="h6">Providers Collection ({providers.length} records)</Typography>
      <Paper sx={{ p: 3, textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: 2, mt: 2 }}>
        <Typography>Real provider data is now fetched from the backend API.</Typography>
        <Typography>Visit <code>/api/providers/</code> to see the actual data.</Typography>
      </Paper>
    </Box>
  );

  const renderInsurancePlans = () => (
    <Box>
      <Typography variant="h6">Insurance Plans Collection ({insurance_plans.length} records)</Typography>
      <Paper sx={{ p: 3, textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: 2, mt: 2 }}>
        <Typography>Real insurance data is now fetched from the backend API.</Typography>
        <Typography>Visit <code>/api/insurance/</code> to see the actual data.</Typography>
      </Paper>
    </Box>
  );

  const renderCptCodes = () => (
    <Box>
      <Typography variant="h6">CPT Codes Collection ({cpt_codes.length} records)</Typography>
      <Paper sx={{ p: 3, textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: 2, mt: 2 }}>
        <Typography>CPT codes are now calculated dynamically based on symptoms.</Typography>
        <Typography>Cost estimates use simplified calculations for demo purposes.</Typography>
      </Paper>
    </Box>
  );

  const renderBookings = () => (
    <Box>
      <Typography variant="h6">Bookings Collection ({bookings.length} records)</Typography>
      <Paper sx={{ p: 3, textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: 2, mt: 2 }}>
        <Typography>Real booking data is now stored in the backend database.</Typography>
        <Typography>Visit <code>/api/bookings/</code> to see the actual data.</Typography>
      </Paper>
    </Box>
  );

  const tabs = [
    { id: 'providers', label: 'Providers', count: providers.length },
    { id: 'insurance', label: 'Insurance Plans', count: insurance_plans.length },
    { id: 'cpt', label: 'CPT Codes', count: cpt_codes.length },
    { id: 'bookings', label: 'Bookings', count: bookings.length },
  ];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <Paper elevation={3} sx={{ borderRadius: 3, p: 4, mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 3, color: '#333', fontWeight: 700 }}>
            Admin / Developer View
          </Typography>
          <Paper sx={{ background: '#f8f9fa', p: 2, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>📊 Database Collections</Typography>
            <Typography sx={{ color: '#666' }}>
              This view shows the raw data from all MongoDB collections for testing and development purposes.
            </Typography>
          </Paper>
          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            {tabs.map(tab => (
              <Tab
                key={tab.id}
                value={tab.id}
                label={`${tab.label} (${tab.count})`}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Tabs>
          {/* Tab Content */}
          <Box sx={{ minHeight: 400 }}>
            {activeTab === 'providers' && renderProviders()}
            {activeTab === 'insurance' && renderInsurancePlans()}
            {activeTab === 'cpt' && renderCptCodes()}
            {activeTab === 'bookings' && renderBookings()}
          </Box>
          <Paper sx={{ background: '#e8f5e8', p: 2, borderRadius: 2, mt: 4, border: '1px solid #28a745' }}>
            <Typography variant="h6" sx={{ color: '#155724', mb: 1 }}>🔧 Development Notes</Typography>
            <Box component="ul" sx={{ color: '#155724', m: 0, pl: 3 }}>
              <li>All data is now fetched from the backend MongoDB database</li>
              <li>Provider matching uses the backend API with real data</li>
              <li>Booking system creates real records in the database</li>
              <li>Cost estimates use simplified calculations for demo purposes</li>
            </Box>
          </Paper>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default AdminDevView; 