// Comprehensive validation utilities
export const validateSymptoms = (symptoms) => {
  // If symptoms is an array, join to string
  let symptomsStr = symptoms;
  if (Array.isArray(symptoms)) {
    symptomsStr = symptoms.join(', ');
  }
  if (!symptomsStr || symptomsStr.trim().length === 0) {
    return { isValid: false, error: 'Please describe your symptoms' };
  }
  // Accept single symptom even if less than 10 characters
  if (Array.isArray(symptoms) && symptoms.length === 1 && symptoms[0].trim().length > 0) {
    return { isValid: true, error: null };
  }
  if (symptomsStr.trim().length < 10) {
    return { isValid: false, error: 'Please provide more detailed symptoms (at least 10 characters)' };
  }
  
  if (symptomsStr.trim().length > 500) {
    return { isValid: false, error: 'Symptoms description is too long (maximum 500 characters)' };
  }
  
  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(symptomsStr)) {
      return { isValid: false, error: 'Invalid content detected in symptoms' };
    }
  }
  
  return { isValid: true, error: null };
};

export const validateLocation = (location) => {
  if (!location || location.trim().length === 0) {
    return { isValid: false, error: 'Please enter your location' };
  }
  
  if (location.trim().length < 3) {
    return { isValid: false, error: 'Location must be at least 3 characters' };
  }
  
  if (location.trim().length > 100) {
    return { isValid: false, error: 'Location is too long (maximum 100 characters)' };
  }
  // Allow all common address characters, do not block spaces or special symbols
  return { isValid: true, error: null };
};

export const validateInsurance = (insurance) => {
  const validInsurances = [
    'Apollo Munich', 'Bajaj Allianz', 'ICICI Lombard', 'Star Health', 
    'HDFC ERGO', 'Max Bupa', 'Religare', 'Cigna TTK'
  ];
  
  if (!insurance) {
    return { isValid: false, error: 'Please select your insurance provider' };
  }
  
  if (!validInsurances.includes(insurance)) {
    return { isValid: false, error: 'Please select a valid insurance provider' };
  }
  
  return { isValid: true, error: null };
};

export const validateAppointmentDate = (date) => {
  if (!date) {
    return { isValid: false, error: 'Please select an appointment date' };
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return { isValid: false, error: 'Appointment date cannot be in the past' };
  }
  
  // Check if date is within reasonable range (next 6 months)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  if (selectedDate > sixMonthsFromNow) {
    return { isValid: false, error: 'Appointment date cannot be more than 6 months in the future' };
  }
  
  return { isValid: true, error: null };
};

export const validateAppointmentTime = (time) => {
  if (!time) {
    return { isValid: false, error: 'Please select an appointment time' };
  }
  
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timePattern.test(time)) {
    return { isValid: false, error: 'Please select a valid appointment time' };
  }
  
  const [hours] = time.split(':');
  const hour = parseInt(hours);
  
  // Business hours: 9 AM to 6 PM
  if (hour < 9 || hour >= 18) {
    return { isValid: false, error: 'Appointments are only available between 9 AM and 6 PM' };
  }
  
  return { isValid: true, error: null };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  // Remove potentially dangerous characters except spaces and address symbols
  sanitized = sanitized.replace(/[<>"'&]/g, '');
  // Do NOT trim whitespace inside the string, only at the ends
  sanitized = sanitized.replace(/^\s+|\s+$/g, '');
  return sanitized;
};

export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Please enter your name' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name is too long (maximum 50 characters)' };
  }
  
  const namePattern = /^[a-zA-Z\s'-]+$/;
  if (!namePattern.test(name.trim())) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  
  return { isValid: true, error: null };
};

export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Please enter your email address' };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
};

export const validatePassword = (password) => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Please enter a password' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (maximum 128 characters)' };
  }
  
  return { isValid: true, error: null };
};

export const validatePhoneNumber = (phone) => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Please enter your phone number' };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must have at least 10 digits' };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  return { isValid: true, error: null };
};

export const validateZipCode = (zipCode) => {
  if (!zipCode || zipCode.trim().length === 0) {
    return { isValid: false, error: 'Please enter your zip code' };
  }
  
  const zipPattern = /^\d{5}(-\d{4})?$/;
  if (!zipPattern.test(zipCode.trim())) {
    return { isValid: false, error: 'Please enter a valid zip code (e.g., 12345 or 12345-6789)' };
  }
  
  return { isValid: true, error: null };
};

export const validatePincode = (pincode) => {
  if (!pincode || pincode.trim().length === 0) {
    return { isValid: false, error: 'Please enter your pincode' };
  }
  
  const pincodePattern = /^\d{6}$/;
  if (!pincodePattern.test(pincode.trim())) {
    return { isValid: false, error: 'Please enter a valid 6-digit pincode' };
  }
  
  return { isValid: true, error: null };
};

export const validateAge = (age) => {
  if (!age || age.trim().length === 0) {
    return { isValid: false, error: 'Please enter your age' };
  }
  
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) {
    return { isValid: false, error: 'Please enter a valid age' };
  }
  
  if (ageNum < 1 || ageNum > 120) {
    return { isValid: false, error: 'Age must be between 1 and 120 years' };
  }
  
  return { isValid: true, error: null };
};

export const validateUserData = (userData) => {
  const errors = {};
  
  const symptomsValidation = validateSymptoms(userData.symptoms);
  if (!symptomsValidation.isValid) {
    errors.symptoms = symptomsValidation.error;
  }
  
  const locationValidation = validateLocation(userData.location);
  if (!locationValidation.isValid) {
    errors.location = locationValidation.error;
  }
  
  const insuranceValidation = validateInsurance(userData.insurance);
  if (!insuranceValidation.isValid) {
    errors.insurance = insuranceValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 