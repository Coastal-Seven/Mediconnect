import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserIntakeForm from './pages/UserIntakeForm';
import ProviderResultsPage from './pages/ProviderResultsPage';
import ProviderDetailBooking from './pages/ProviderDetailBooking';
import CostEstimationSummary from './pages/CostEstimationSummary';
import AIGeneratedCareSummary from './pages/AIGeneratedCareSummary';
import SuccessConfirmationPage from './pages/SuccessConfirmationPage';
import AdminDevView from './pages/AdminDevView';
import { UserDataProvider } from './context/UserDataContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <UserDataProvider>
        <Router>
                  <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/intake" element={<UserIntakeForm />} />
            <Route path="/results" element={<ProviderResultsPage />} />
            <Route path="/provider/:id" element={<ProviderDetailBooking />} />
            <Route path="/cost-estimate" element={<CostEstimationSummary />} />
            <Route path="/summary" element={<AIGeneratedCareSummary />} />
            <Route path="/confirmation" element={<SuccessConfirmationPage />} />
            <Route path="/admin" element={<AdminDevView />} />
          </Routes>
        </div>
        </Router>
      </UserDataProvider>
    </ErrorBoundary>
  );
}

export default App; 