import React, { useState, useEffect } from 'react';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { format } from 'date-fns';
// Add framer-motion import
import { motion } from 'framer-motion';

const AdminDevView = () => {
  const [activeTab, setActiveTab] = useState('providers');
  const [bookings, setBookings] = useState([]);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  
  // Empty arrays since we're using real data from backend
  const providers = [];
  const insurance_plans = [];
  const cpt_codes = [];

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/bookings/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      setBookings([]);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/cancel/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        fetchBookings();
        alert('Appointment cancelled and deleted successfully.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Failed to cancel appointment.' + (errorData.detail ? ` Reason: ${errorData.detail}` : ''));
      }
    } catch (e) {
      alert('Error cancelling appointment.');
    }
  };

  const openRescheduleDialog = (bookingId) => {
    setRescheduleBookingId(bookingId);
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleOpen(true);
  };
  const closeRescheduleDialog = () => {
    setRescheduleOpen(false);
    setRescheduleBookingId(null);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select both date and time.');
      return;
    }
    const newTime = `${rescheduleDate}T${rescheduleTime}:00`;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/bookings/reschedule/${rescheduleBookingId}?new_time=${encodeURIComponent(newTime)}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      if (response.ok) {
        fetchBookings();
        closeRescheduleDialog();
      } else {
        alert('Failed to reschedule appointment.');
      }
    } catch (e) {
      alert('Error rescheduling appointment.');
    }
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

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  };
  const generateAvailableTimes = () => {
    const times = [];
    for (let hour = 9; hour <= 17; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

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
      {bookings.length === 0 ? (
      <Paper sx={{ p: 3, textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: 2, mt: 2 }}>
          <Typography>No bookings found.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {bookings.map(booking => (
            <Paper key={booking._id || booking.id} elevation={1} sx={{ border: '1px solid #e9ecef', borderRadius: 2, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 700, mb: 0.5 }}>
                  {booking.provider_details?.name || 'Unknown Provider'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>{booking.provider_details?.specialty || ''}</Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  📍 {booking.provider_details?.address || ''}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: booking.status === 'confirmed' ? '#28a745' : '#ffc107' }}>
                  Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>{formatDate(booking.appointment_time)}</Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>{new Date(booking.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" color="error" onClick={() => handleCancel(booking._id || booking.id)} sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={() => openRescheduleDialog(booking._id || booking.id)} sx={{ borderRadius: 2, fontWeight: 600 }}>Reschedule</Button>
              </Stack>
      </Paper>
          ))}
        </Stack>
      )}
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
        <Dialog open={rescheduleOpen} onClose={closeRescheduleDialog}>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogContent>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="reschedule-date" style={{ display: 'block', marginBottom: 4, color: '#333', fontWeight: 500 }}>Select Date</label>
              <select
                id="reschedule-date"
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 12 }}
              >
                <option value="">Choose a date</option>
                {generateAvailableDates().map(date => (
                  <option key={date} value={date}>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="reschedule-time" style={{ display: 'block', marginBottom: 4, color: '#333', fontWeight: 500 }}>Select Time</label>
              <select
                id="reschedule-time"
                value={rescheduleTime}
                onChange={e => setRescheduleTime(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              >
                <option value="">Choose a time</option>
                {generateAvailableTimes().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRescheduleDialog}>Cancel</Button>
            <Button
              onClick={handleRescheduleConfirm}
              variant="contained"
              disabled={!rescheduleDate || !rescheduleTime}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default AdminDevView; 