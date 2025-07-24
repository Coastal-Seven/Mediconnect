import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import { 
  validateName, 
  validatePhoneNumber, 
  validateEmail,
  validateAge,
  validateSymptoms, 
  validateLocation, 
  validatePincode, 
  validateInsurance,
  sanitizeInput 
} from '../utils/validation';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
// Add framer-motion import
import { motion } from 'framer-motion';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const UserIntakeForm = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUserData();
  const [formData, setFormData] = useState({
    name: state.userData.name || '',
    phoneNumber: state.userData.phoneNumber || '',
    age: state.userData.age || '',
    email: state.userData.email || '',
    primarySymptoms: Array.isArray(state.userData.primarySymptoms)
      ? state.userData.primarySymptoms
      : (state.userData.primarySymptoms ? state.userData.primarySymptoms.split(',').map(s => s.trim()) : []),
    duration: state.userData.duration || '',
    urgencyLevel: state.userData.urgencyLevel || '',
    severity: state.userData.severity || '',
    detailedDescription: state.userData.detailedDescription || '',
    address: state.userData.address || '',
    city: state.userData.city || '',
    state: state.userData.state || '',
    pincode: state.userData.pincode || '',
    insuranceProvider: state.userData.insuranceProvider || '',
    insurancePlan: state.userData.insurancePlan || '',
    memberId: state.userData.memberId || ''
  });
  const [errors, setErrors] = useState({});
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!state.user) {
      navigate('/login');
    }
  }, [state.user, navigate]);

  const insuranceOptions = [
    { value: '', label: 'Select your insurance provider' },
    { value: 'Apollo Munich', label: 'Apollo Munich' },
    { value: 'Bajaj Allianz', label: 'Bajaj Allianz' },
    { value: 'ICICI Lombard', label: 'ICICI Lombard' },
    { value: 'Star Health', label: 'Star Health' },
    { value: 'HDFC ERGO', label: 'HDFC ERGO' },
    { value: 'SBI Health', label: 'SBI Health' },
    { value: 'National Insurance', label: 'National Insurance' },
     ];

  const insurancePlans = {
    'Apollo Munich': [
      { value: '', label: 'Select plan' },
      { value: 'Optima Restore', label: 'Optima Restore' },
      { value: 'Optima Secure', label: 'Optima Secure' },
      { value: 'Easy Health', label: 'Easy Health' }
    ],
    'Bajaj Allianz': [
      { value: '', label: 'Select plan' },
      { value: 'Health Guard', label: 'Health Guard' },
      { value: 'Silver Health', label: 'Silver Health' },
      { value: 'Family Floater', label: 'Family Floater' }
    ],
    'ICICI Lombard': [
      { value: '', label: 'Select plan' },
      { value: 'Health Booster', label: 'Health Booster' },
      { value: 'Complete Health', label: 'Complete Health' },
      { value: 'Health Advantage', label: 'Health Advantage' }
    ],
    'Star Health': [
      { value: '', label: 'Select plan' },
      { value: 'Medi Classic', label: 'Medi Classic' },
      { value: 'Senior Citizen', label: 'Senior Citizen' },
      { value: 'Family Health', label: 'Family Health' }
    ],
    'HDFC ERGO': [
      { value: '', label: 'Select plan' },
      { value: 'Health Suraksha', label: 'Health Suraksha' },
      { value: 'My Health', label: 'My Health' },
      { value: 'Optima Restore', label: 'Optima Restore' }
    ],
    'SBI Health': [
      { value: '', label: 'Select plan' },
      { value: 'Arogya Plus', label: 'Arogya Plus' },
      { value: 'Arogya Top Up', label: 'Arogya Top Up' },
      { value: 'Arogya Premier', label: 'Arogya Premier' }
    ],
    'National Insurance': [
      { value: '', label: 'Select plan' },
      { value: 'Mediclaim', label: 'Mediclaim' },
      { value: 'Family Floater', label: 'Family Floater' },
      { value: 'Senior Citizen', label: 'Senior Citizen' }
    ],
  };
  const urgencyLevels = [
    { value: '', label: 'Select urgency level' },
    { value: 'Low', label: 'Low - Can wait a few days' },
    { value: 'Medium', label: 'Medium - Should see doctor soon' },
    { value: 'High', label: 'High - Need immediate attention' },
  ];

  let durationOptions = [
    { value: '', label: 'Select duration' },
    { value: '1-2 Hours', label: '1-2 Hours' },
    { value: '3-4 Hours', label: '3-4 Hours' },
    { value: 'Less than 1 Day', label: 'Less than 1 Day' },
    { value: '1-2 days', label: '1-2 days' },
    { value: '3-6 days', label: '3-6 days' },
    { value: 'More than 1 weak', label: 'More than 3 weak' }
  ];

  const severityLevels = [
    { value: '', label: 'Select severity (1-10)' },
    { value: '1', label: '1 - Very mild, barely noticeable' },
    { value: '2', label: '2 - Mild, slightly bothersome' },
    { value: '3', label: '3 - Mild to moderate' },
    { value: '4', label: '4 - Moderate, noticeable' },
    { value: '5', label: '5 - Moderate, affecting daily activities' },
    { value: '6', label: '6 - Moderate to severe' },
    { value: '7', label: '7 - Severe, significantly affecting life' },
    { value: '8', label: '8 - Very severe, very difficult to bear' },
    { value: '9', label: '9 - Extremely severe, unbearable' },
    { value: '10', label: '10 - Worst possible pain/symptom' }
  ];

  // Add common symptoms for dropdown
  const commonSymptoms = [
    { value: '', label: 'Select your primary symptom' },
    { value: 'Fever', label: 'Fever' },
    { value: 'Cough', label: 'Cough' },
    { value: 'Headache', label: 'Headache' },
    { value: 'Chest pain', label: 'Chest pain' },
    { value: 'Back pain', label: 'Back pain' },
    { value: 'Joint pain', label: 'Joint pain' },
    { value: 'Rash', label: 'Rash' },
    { value: 'Fatigue', label: 'Fatigue' },
    { value: 'Shortness of breath', label: 'Shortness of breath' },
    { value: 'Abdominal pain', label: 'Abdominal pain' },
    { value: 'Dizziness', label: 'Dizziness' },
    { value: 'Sore throat', label: 'Sore throat' },
    { value: 'Vomiting', label: 'Vomiting' },
    { value: 'Diarrhea', label: 'Diarrhea' },
    { value: 'Other', label: 'Other (please specify)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    // Only sanitize fields that are not address or detailedDescription or city/state
    if (name !== 'address' && name !== 'detailedDescription' && name !== 'city' && name !== 'state') {
      newValue = sanitizeInput(newValue);
    }
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddSymptom = () => {
    let symptomToAdd = selectedSymptom;
    if (selectedSymptom === 'Other' && customSymptom.trim()) {
      symptomToAdd = customSymptom.trim();
    }
    if (
      symptomToAdd &&
      !formData.primarySymptoms.includes(symptomToAdd)
    ) {
      setFormData(prev => ({
        ...prev,
        primarySymptoms: [...prev.primarySymptoms, symptomToAdd]
      }));
      setSelectedSymptom('');
      setCustomSymptom('');
    }
  };

  const handleRemoveSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      primarySymptoms: prev.primarySymptoms.filter(s => s !== symptom)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Personal Details Validation
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }
    
    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phoneNumber = phoneValidation.error;
    }

    const ageValidation = validateAge(formData.age);
    if (!ageValidation.isValid) {
      newErrors.age = ageValidation.error;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }
    
    // Symptoms & Concerns Validation
    const symptomsValidation = validateSymptoms(formData.primarySymptoms);
    if (!symptomsValidation.isValid) {
      newErrors.primarySymptoms = symptomsValidation.error;
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    }

    if (!formData.urgencyLevel) {
      newErrors.urgencyLevel = 'Urgency level is required';
    }

    if (!formData.severity) {
      newErrors.severity = 'Severity level is required';
    }

    // Detailed Description: require at least one space
    if (!formData.detailedDescription.trim()) {
      newErrors.detailedDescription = 'Detailed description is required';
    } else if (!formData.detailedDescription.includes(' ')) {
      newErrors.detailedDescription = 'Please enter a valid description with spaces.';
    }
    
    // Location Information Validation (all mandatory)
    const addressValidation = validateLocation(formData.address);
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.error;
    } else if (formData.address.length < 5) {
      newErrors.address = 'Please enter a valid address (at least 5 characters).';
    }
    
    const cityValidation = validateLocation(formData.city);
    if (!cityValidation.isValid) {
      newErrors.city = cityValidation.error;
    }

    // State: only allow alphabetic characters and spaces, mandatory
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (!/^[A-Za-z ]+$/.test(formData.state)) {
      newErrors.state = 'State must contain only letters and spaces.';
    }

    const pincodeValidation = validatePincode(formData.pincode);
    if (!pincodeValidation.isValid) {
      newErrors.pincode = pincodeValidation.error;
    }
    
    // Insurance Information Validation (all mandatory)
    if (!formData.insuranceProvider) {
      newErrors.insuranceProvider = 'Insurance provider is required';
    }
    if (!formData.insurancePlan) {
      newErrors.insurancePlan = 'Please select your insurance plan';
    }
    if (!formData.memberId || !formData.memberId.trim()) {
      newErrors.memberId = 'Member ID is required';
    }

    // City: only allow letters and spaces
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[A-Za-z ]+$/.test(formData.city.trim())) {
      newErrors.city = 'City must contain only letters and spaces.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Get user ID from context or localStorage
      const user = state.user;
      if (!user || !user.id) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      // Use all selected symptoms
      let primarySymptomsValue = formData.primarySymptoms;
      if (Array.isArray(primarySymptomsValue)) {
        primarySymptomsValue = primarySymptomsValue.join(', ');
      }
      // Prepare data for backend
      const intakeData = {
        user_id: user.id,
        primarySymptoms: primarySymptomsValue,
        duration: formData.duration,
        urgencyLevel: formData.urgencyLevel,
        severity: formData.severity,
        detailedDescription: formData.detailedDescription,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        insuranceProvider: formData.insuranceProvider,
        insurancePlan: formData.insurancePlan,
        memberId: formData.memberId || null
      };

      // Real API call to backend
      const response = await fetch('http://127.0.0.1:8000/api/intake/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(intakeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit intake form');
      }

      const result = await response.json();
      console.log('Intake form submitted successfully:', result);

      // Store in context for frontend use
      dispatch({
        type: 'SET_USER_DATA',
        payload: { ...formData, primarySymptoms: formData.primarySymptoms } // always array
      });

      // Navigate to results page
      navigate('/results');
      
    } catch (error) {
      console.error('Intake form submission error:', error);
      alert('Failed to submit form: ' + error.message);
    }
  };

  const steps = [
    'Personal Details',
    'Symptoms & Concerns',
    'Location Information',
    'Insurance Information',
  ];

  const getStepFields = (step, formData, errors, handleInputChange, selectedSymptom, setSelectedSymptom, customSymptom, setCustomSymptom, handleAddSymptom, handleRemoveSymptom, commonSymptoms, urgencyLevels, severityLevels, insuranceOptions, insurancePlans) => {
    switch (step) {
      case 0:
        // Personal Details
        return (
          <Box mb={5}>
            <Typography variant="h6" sx={{ color: '#333', mb: 3, fontWeight: 700 }}>Personal Details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Mobile Number *"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Age *"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter your age"
                  error={!!errors.age}
                  helperText={errors.age}
                  fullWidth
                  inputProps={{ min: 1, max: 120 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Email ID *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        // Symptoms & Concerns
        return (
          <Box mb={5}>
            <Typography variant="h6" sx={{ color: '#333', mb: 3, fontWeight: 700 }}>Symptoms & Concerns</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.primarySymptoms} sx={{ minWidth: 200 }}>
                  <InputLabel id="primarySymptoms-label">Primary Symptom(s) or Concern *</InputLabel>
                  <Select
                    labelId="primarySymptoms-label"
                    id="primarySymptomsDropdown"
                    value={selectedSymptom}
                    label="Primary Symptom(s) or Concern *"
                    onChange={e => setSelectedSymptom(e.target.value)}
                  >
                    <MenuItem value=""><em>Select a symptom</em></MenuItem>
                    {commonSymptoms.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button onClick={handleAddSymptom} variant="contained" sx={{ mt: 2, ml: 1, borderRadius: 2, fontWeight: 600 }}>Add</Button>
                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                  {formData.primarySymptoms.map(symptom => (
                    <Chip
                      key={symptom}
                      label={symptom}
                      onDelete={() => handleRemoveSymptom(symptom)}
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
                {errors.primarySymptoms && <Typography color="error" variant="body2" mt={1}>{errors.primarySymptoms}</Typography>}
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth error={!!errors.duration} sx={{ minWidth: 200 }}>
                  <InputLabel id="duration-label">Duration *</InputLabel>
                  <Select
                    labelId="duration-label"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    label="Duration *"
                    onChange={handleInputChange}
                  >
                    <MenuItem value=""><em>Select duration</em></MenuItem>
                    <MenuItem value="<1 hour">Less than 1 hour</MenuItem>
                    <MenuItem value="1-2 hours">1-2 hours</MenuItem>
                    <MenuItem value="3-7 hours">3-7 hours</MenuItem>
                    <MenuItem value="8-12 hours">8-12 hours</MenuItem>
                    <MenuItem value="1 day">1 day</MenuItem>
                    <MenuItem value="2-3 days">2-3 days</MenuItem>
                    <MenuItem value="4-7 days">4-7 days</MenuItem>
                    <MenuItem value="1-2 weeks">1-2 weeks</MenuItem>
                    <MenuItem value="2-4 weeks">2-4 weeks</MenuItem>
                    <MenuItem value="1+ months">1+ months</MenuItem>
                  </Select>
                </FormControl>
                {errors.duration && <Typography color="error" variant="body2" mt={1}>{errors.duration}</Typography>}
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth error={!!errors.urgencyLevel} sx={{ minWidth: 200 }}>
                  <InputLabel id="urgencyLevel-label">Urgency Level *</InputLabel>
                  <Select
                    labelId="urgencyLevel-label"
                    id="urgencyLevel"
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    label="Urgency Level *"
                    onChange={handleInputChange}
                  >
                    {urgencyLevels.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.urgencyLevel && <Typography color="error" variant="body2" mt={1}>{errors.urgencyLevel}</Typography>}
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth error={!!errors.severity} sx={{ minWidth: 200 }}>
                  <InputLabel id="severity-label">Severity (1-10 scale) *</InputLabel>
                  <Select
                    labelId="severity-label"
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    label="Severity (1-10 scale) *"
                    onChange={handleInputChange}
                  >
                    {severityLevels.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.severity && <Typography color="error" variant="body2" mt={1}>{errors.severity}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Detailed Description *"
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleInputChange}
                  placeholder="Please provide a detailed description of your symptoms, when they started, what makes them better or worse, and any other relevant information..."
                  error={!!errors.detailedDescription}
                  helperText={errors.detailedDescription}
                  fullWidth
                  multiline
                  rows={6}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        // Location Information
        return (
          <Box mb={5}>
            <Typography variant="h6" sx={{ color: '#333', mb: 3, fontWeight: 700 }}>Location Information</Typography>
            <TextField
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your street address"
              error={!!errors.address}
              helperText={errors.address}
              fullWidth
              sx={{ mb: 3 }}
            />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  error={!!errors.city}
                  helperText={errors.city}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter your state"
                  error={!!errors.state}
                  helperText={errors.state}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Enter pincode"
                  error={!!errors.pincode}
                  helperText={errors.pincode}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        // Insurance Information
        return (
          <Box mb={5}>
            <Typography variant="h6" sx={{ color: '#333', mb: 3, fontWeight: 700 }}>Insurance Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.insuranceProvider} sx={{ minWidth: 200 }}>
                  <InputLabel id="insuranceProvider-label">Insurance Provider</InputLabel>
                  <Select
                    labelId="insuranceProvider-label"
                    id="insuranceProvider"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    label="Insurance Provider"
                    onChange={handleInputChange}
                  >
                    {insuranceOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.insuranceProvider && <Typography color="error" variant="body2" mt={1}>{errors.insuranceProvider}</Typography>}
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth error={!!errors.insurancePlan} disabled={!formData.insuranceProvider} sx={{ minWidth: 200 }}>
                  <InputLabel id="insurancePlan-label">Plan Type *</InputLabel>
                  <Select
                    labelId="insurancePlan-label"
                    id="insurancePlan"
                    name="insurancePlan"
                    value={formData.insurancePlan}
                    label="Plan Type *"
                    onChange={handleInputChange}
                    disabled={!formData.insuranceProvider}
                  >
                    {formData.insuranceProvider && insurancePlans[formData.insuranceProvider] 
                      ? insurancePlans[formData.insuranceProvider].map(option => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))
                      : <MenuItem value="">Select insurance provider first</MenuItem>
                    }
                  </Select>
                </FormControl>
                {errors.insurancePlan && <Typography color="error" variant="body2" mt={1}>{errors.insurancePlan}</Typography>}
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Member ID"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleInputChange}
                  placeholder="Enter your member ID"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  const [activeStep, setActiveStep] = useState(0);

  const validateStep = (step) => {
    // Only validate fields for the current step
    const stepFields = [
      ['name', 'phoneNumber', 'age', 'email'],
      ['primarySymptoms', 'duration', 'urgencyLevel', 'severity', 'detailedDescription'],
      ['address', 'city', 'state', 'pincode'],
      ['insuranceProvider', 'insurancePlan', 'memberId'],
    ];
    const newErrors = {};
    // Validate only the fields for the current step
    stepFields[step].forEach(field => {
      switch (field) {
        case 'name': {
          const v = validateName(formData.name);
          if (!v.isValid) newErrors.name = v.error;
          break;
        }
        case 'phoneNumber': {
          const v = validatePhoneNumber(formData.phoneNumber);
          if (!v.isValid) newErrors.phoneNumber = v.error;
          break;
        }
        case 'age': {
          const v = validateAge(formData.age);
          if (!v.isValid) newErrors.age = v.error;
          break;
        }
        case 'email': {
          const v = validateEmail(formData.email);
          if (!v.isValid) newErrors.email = v.error;
          break;
        }
        case 'primarySymptoms': {
          const v = validateSymptoms(formData.primarySymptoms);
          if (!v.isValid) newErrors.primarySymptoms = v.error;
          break;
        }
        case 'duration': {
          if (!formData.duration) newErrors.duration = 'Duration is required';
          break;
        }
        case 'urgencyLevel': {
          if (!formData.urgencyLevel) newErrors.urgencyLevel = 'Urgency level is required';
          break;
        }
        case 'severity': {
          if (!formData.severity) newErrors.severity = 'Severity level is required';
          break;
        }
        case 'detailedDescription': {
          if (!formData.detailedDescription.trim()) {
            newErrors.detailedDescription = 'Detailed description is required';
          } else if (!formData.detailedDescription.includes(' ')) {
            newErrors.detailedDescription = 'Please enter a valid description with spaces.';
          }
          break;
        }
        case 'address': {
          const v = validateLocation(formData.address);
          if (!v.isValid) newErrors.address = v.error;
          else if (formData.address.length < 5) newErrors.address = 'Please enter a valid address (at least 5 characters).';
          break;
        }
        case 'city': {
          const v = validateLocation(formData.city);
          if (!v.isValid) newErrors.city = v.error;
          else if (!formData.city.trim()) newErrors.city = 'City is required';
          else if (!/^[A-Za-z ]+$/.test(formData.city.trim())) newErrors.city = 'City must contain only letters and spaces.';
          break;
        }
        case 'state': {
          if (!formData.state.trim()) newErrors.state = 'State is required';
          else if (!/^[A-Za-z ]+$/.test(formData.state)) newErrors.state = 'State must contain only letters and spaces.';
          break;
        }
        case 'pincode': {
          const v = validatePincode(formData.pincode);
          if (!v.isValid) newErrors.pincode = v.error;
          break;
        }
        case 'insuranceProvider': {
          if (!formData.insuranceProvider) newErrors.insuranceProvider = 'Insurance provider is required';
          break;
        }
        case 'insurancePlan': {
          if (!formData.insurancePlan) newErrors.insurancePlan = 'Please select your insurance plan';
          break;
        }
        case 'memberId': {
          if (!formData.memberId || !formData.memberId.trim()) newErrors.memberId = 'Member ID is required';
          break;
        }
        default:
          break;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3 }}>
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <Paper elevation={8} sx={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 4,
          p: 5,
          maxWidth: 800,
          mx: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box sx={{
              width: 70,
              height: 70,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: 'white',
              fontWeight: 'bold',
              boxShadow: 3,
              margin: '0 auto 20px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <span style={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>⚕️</span>
            </Box>
            <Typography variant="h4" sx={{ color: '#333', mb: 1, fontWeight: 700 }}>Patient Intake Form</Typography>
            <Typography variant="subtitle1" sx={{ color: '#666', maxWidth: 600, mx: 'auto' }}>
              {state.user?.isNewUser 
                ? "Welcome! Let's get to know you better to find the perfect healthcare provider."
                : "Please update your information to help us find the best healthcare providers for you."
              }
            </Typography>
          </Box>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {getStepFields(
              activeStep,
              formData,
              errors,
              handleInputChange,
              selectedSymptom,
              setSelectedSymptom,
              customSymptom,
              setCustomSymptom,
              handleAddSymptom,
              handleRemoveSymptom,
              commonSymptoms,
              urgencyLevels,
              severityLevels,
              insuranceOptions,
              insurancePlans
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={5}>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={activeStep === 0 ? () => navigate('/dashboard') : handleBack}
                sx={{ borderRadius: 2, fontWeight: 600, flex: 1 }}
              >
                {activeStep === 0 ? 'Back to Dashboard' : 'Back'}
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ borderRadius: 2, fontWeight: 600, flex: 2 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 2, fontWeight: 600, flex: 2 }}
                >
                  Submit Intake Form
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default UserIntakeForm; 