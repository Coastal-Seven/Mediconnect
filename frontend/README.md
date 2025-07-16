# Smart Care Routing Agent

A React-based healthcare provider matching and booking application that helps users find the best healthcare providers based on their symptoms, location, and insurance coverage.

## Features

- **Smart Provider Matching**: AI-powered provider recommendations based on symptoms and insurance
- **Cost Transparency**: Real-time cost estimates with insurance coverage breakdown
- **Easy Booking**: Streamlined appointment booking process
- **AI-Generated Care Summaries**: Personalized care expectations and preparation tips
- **Admin/Developer View**: Raw data access for testing and development

## Pages

1. **Landing Page** (`/`) - Introduction and call-to-action
2. **User Intake Form** (`/intake`) - Collect symptoms, location, insurance
3. **Provider Results** (`/results`) - Display top 3 matched providers
4. **Provider Detail & Booking** (`/provider/:id`) - Provider info and appointment booking
5. **Cost Estimation** (`/cost-estimate`) - CPT breakdown and out-of-pocket costs
6. **AI Care Summary** (`/summary`) - Personalized care expectations
7. **Confirmation** (`/confirmation`) - Booking confirmation
8. **Admin View** (`/admin`) - Raw data for testing

## Technology Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: CSS3 with modern design patterns
- **Data Management**: React Context API
- **Date Handling**: date-fns
- **Maps**: Leaflet (ready for integration)
- **HTTP Client**: Axios (ready for API integration)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-care-routing-agent
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable components
├── context/            # React Context for state management
│   └── UserDataContext.js
├── data/               # Sample data and mock APIs
│   └── sampleData.js
├── pages/              # Page components
│   ├── LandingPage.js
│   ├── UserIntakeForm.js
│   ├── ProviderResultsPage.js
│   ├── ProviderDetailBooking.js
│   ├── CostEstimationSummary.js
│   ├── AIGeneratedCareSummary.js
│   ├── SuccessConfirmationPage.js
│   └── AdminDevView.js
├── App.js              # Main app component with routing
├── index.js            # App entry point
└── index.css           # Global styles
```

## Data Models

### Providers Collection
```javascript
{
  id: "prov_001",
  name: "Dr. Lisa Wong",
  specialty: "Dermatologist",
  accepted_insurances: ["Aetna", "Blue Cross"],
  location: { lat: 40.741895, lng: -73.989308 },
  address: "123 Skin St, New York, NY",
  rating: 4.8,
  wait_time: "20 mins",
  phone: "(555) 123-4567",
  email: "dr.wong@healthcare.com",
  experience: "15 years",
  education: "Harvard Medical School"
}
```

### Insurance Plans Collection
```javascript
{
  id: "ins_001",
  company: "Aetna",
  plan: "Silver PPO",
  cpt_coverage: {
    "99213": 0.75,
    "80050": 0.6,
    "99214": 0.8,
    "99215": 0.85
  }
}
```

### CPT Codes Collection
```javascript
{
  code: "99213",
  description: "Office or other outpatient visit, established patient, 20-29 minutes",
  base_price: 100
}
```

## Key Features Implementation

### Provider Matching Algorithm
- Filters providers by insurance acceptance
- Sorts by rating and wait time
- Returns top 3 matches

### Cost Calculation
- Determines appropriate CPT code based on symptoms
- Calculates insurance coverage percentage
- Shows base price, covered amount, and out-of-pocket cost

### AI-Generated Care Summaries
- Analyzes symptoms and provider specialty
- Generates personalized care expectations
- Provides preparation tips

## Future Enhancements

- **Backend Integration**: Connect to MongoDB for real data storage
- **Map Integration**: Add interactive maps showing provider locations
- **Real-time Availability**: Check actual appointment availability
- **User Authentication**: Add user accounts and booking history
- **Payment Integration**: Process payments for appointments
- **Telemedicine Support**: Add virtual appointment options
- **Provider Reviews**: User-generated reviews and ratings
- **Insurance Verification**: Real-time insurance eligibility checks

## Testing

Run the test suite:
```bash
npm test
```

## Building for Production

Create a production build:
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team. 