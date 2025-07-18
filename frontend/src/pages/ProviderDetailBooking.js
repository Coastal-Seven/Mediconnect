import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import { format } from 'date-fns';
import GoogleMapReact from 'google-map-react';
// Add framer-motion import
import { motion } from 'framer-motion';
import { fetchWithAuth } from '../utils/authFetch';

const MapMarker = ({ text }) => (
  <div style={{ color: 'red', fontWeight: 'bold', fontSize: '24px' }}>
    📍
    <div style={{ fontSize: '12px', color: '#333' }}>{text}</div>
  </div>
);

const ProviderDetailBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useUserData();
  const [provider, setProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 16.3067, lng: 80.4365 }); // Default: Guntur
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/providers/${id}`);
        if (!response.ok) throw new Error('Provider not found');
        const data = await response.json();
        setProvider(data);
      } catch (e) {
        setProvider(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id]);

  // Geocode provider address using Google Maps Geocoding API (HTTP fetch)
  useEffect(() => {
    const geocodeAddress = async () => {
      if (provider && provider.address) {
        try {
          const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(provider.address)}&key=${apiKey}`
          );
          const data = await response.json();
          if (data.status === 'OK' && data.results && data.results[0]) {
            setMapCenter({
              lat: data.results[0].geometry.location.lat,
              lng: data.results[0].geometry.location.lng,
            });
          }
        } catch (e) {
          // Ignore geocoding errors
        }
      }
    };
    geocodeAddress();
  }, [provider]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    // Check for access token before proceeding
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    try {
      // Get user ID from context
      const user = state.user;
      if (!user || !user.id) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      // Construct appointment time in local time and send as ISO string
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`; // No conversion to UTC
      
      // Prepare booking data for backend
      const bookingData = {
        provider_id: provider.id || provider._id,
        appointment_time: appointmentDateTime,
        insurance_provider: state.userData.insuranceProvider,
        insurance_plan: state.userData.insurancePlan,
        member_id: state.userData.memberId,
      };

      // Use fetchWithAuth for authenticated request
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/bookings/', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Booking created successfully:', result);
      
      // Store in context for frontend use
      dispatch({
        type: 'SET_SELECTED_PROVIDER',
        payload: provider
      });

      dispatch({
        type: 'SET_BOOKING_DATA',
        payload: {
          appointment_time: appointmentDateTime,
          provider_id: provider._id
        }
      });

      // Navigate to cost estimate
      navigate('/cost-estimate');
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking: ' + error.message);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆');
    }
    
    return stars.join('');
  };

  const generateAvailableTimes = () => {
    const times = [];
    for (let hour = 9; hour <= 17; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times;
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

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">
            <h2>Loading provider details...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container">
        <div className="card">
          <div className="error">
            <h3>Provider not found</h3>
            <p>The requested provider could not be found.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/results')}
              style={{ marginTop: '16px' }}
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="card"
      >
        <h1 style={{ marginBottom: '30px', color: '#333' }}>
          {provider.name}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          {/* Provider Information */}
          <div>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Provider Information</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', marginBottom: '8px' }}>Specialty</h3>
              <p style={{ fontSize: '1.1rem' }}>{provider.specialty}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', marginBottom: '8px' }}>Rating</h3>
              <div className="rating" style={{ fontSize: '1.2rem' }}>
                {renderStars(provider.rating)} {provider.rating}/5
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', marginBottom: '8px' }}>Wait Time</h3>
              <p>⏱️ {provider.wait_time}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', marginBottom: '8px' }}>Location</h3>
              <p>📍 {provider.address}</p>
              <div style={{ height: '250px', width: '100%', marginTop: '10px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <GoogleMapReact
                  bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
                  defaultCenter={mapCenter}
                  center={mapCenter}
                  defaultZoom={15}
                  yesIWantToUseGoogleMapApiInternals
                >
                  <MapMarker lat={mapCenter.lat} lng={mapCenter.lng} text={provider.name} />
                </GoogleMapReact>
              </div>
              <button
                style={{ marginTop: '12px', padding: '10px 18px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}
                onClick={() => {
                  const destination = encodeURIComponent(provider.address);
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
                }}
              >
                Get Directions
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', marginBottom: '8px' }}>Contact</h3>
              <p>📞 {provider.phone}</p>
              <p>✉️ {provider.email}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', marginBottom: '8px' }}>Experience</h3>
              <p>{provider.experience}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', marginBottom: '8px' }}>Education</h3>
              <p>{provider.education}</p>
            </div>

            <div>
              <h3 style={{ color: '#666', marginBottom: '8px' }}>Accepted Insurance</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {provider.accepted_insurances.map(insurance => (
                  <span 
                    key={insurance}
                    style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {insurance}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Book Appointment</h2>
            
            <div className="form-group">
              <label htmlFor="appointment-date">Select Date</label>
              <select
                id="appointment-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">Choose a date</option>
                {generateAvailableDates().map(date => (
                  <option key={date} value={date}>
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appointment-time">Select Time</label>
              <select
                id="appointment-time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="">Choose a time</option>
                {generateAvailableTimes().map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ marginBottom: '8px' }}>Your Information:</h3>
              <p><strong>Symptoms:</strong> {state.userData.primarySymptoms || '-'}</p>
              <p><strong>Insurance:</strong> {state.userData.insuranceProvider ? `${state.userData.insuranceProvider}${state.userData.insurancePlan ? ' - ' + state.userData.insurancePlan : ''}` : '-'}</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleBooking}
              style={{ width: '100%', padding: '16px' }}
              disabled={!selectedDate || !selectedTime}
            >
              Continue to Cost Estimate
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/results')}
          >
            Back to Results
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProviderDetailBooking; 