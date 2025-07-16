// Enhanced provider matching algorithm
export const matchProviders = (userData, providers) => {
  const { symptoms, insurance } = userData;
  
  // Symptom to specialty mapping
  const symptomSpecialtyMap = {
    'rash': ['Dermatologist'],
    'skin': ['Dermatologist'],
    'acne': ['Dermatologist'],
    'chest pain': ['Cardiologist', 'Primary Care Physician'],
    'heart': ['Cardiologist'],
    'headache': ['Neurologist', 'Primary Care Physician'],
    'migraine': ['Neurologist'],
    'back pain': ['Orthopedic Surgeon', 'Primary Care Physician'],
    'joint pain': ['Orthopedic Surgeon'],
    'fever': ['Primary Care Physician'],
    'cough': ['Primary Care Physician'],
    'fatigue': ['Primary Care Physician']
  };

  // Determine relevant specialties based on symptoms
  const relevantSpecialties = [];
  const symptomLower = symptoms.toLowerCase();
  
  Object.entries(symptomSpecialtyMap).forEach(([symptom, specialties]) => {
    if (symptomLower.includes(symptom)) {
      relevantSpecialties.push(...specialties);
    }
  });

  // If no specific symptoms match, default to primary care
  if (relevantSpecialties.length === 0) {
    relevantSpecialties.push('Primary Care Physician');
  }

  // Filter and score providers
  const scoredProviders = providers
    .filter(provider => !insurance || provider.accepted_insurances.includes(insurance))
    .map(provider => {
      let score = 0;
      
      // Specialty match (highest weight)
      if (relevantSpecialties.includes(provider.specialty)) {
        score += 50;
      } else if (provider.specialty === 'Primary Care Physician') {
        score += 20; // PCP gets some points as fallback
      }
      
      // Rating (0-5 scale, multiply by 10)
      score += provider.rating * 10;
      
      // Wait time (shorter is better, max 30 points)
      const waitMinutes = parseInt(provider.wait_time);
      if (waitMinutes <= 15) score += 30;
      else if (waitMinutes <= 30) score += 20;
      else if (waitMinutes <= 60) score += 10;
      
      // Experience bonus (up to 10 points)
      const experienceYears = parseInt(provider.experience);
      if (experienceYears >= 15) score += 10;
      else if (experienceYears >= 10) score += 7;
      else if (experienceYears >= 5) score += 5;
      
      return {
        ...provider,
        matchScore: score,
        specialtyMatch: relevantSpecialties.includes(provider.specialty),
        relevantSpecialties
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return scoredProviders;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}; 