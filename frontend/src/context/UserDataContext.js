import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDataContext = createContext();

const initialState = {
  user: null,
  registeredUsers: [], // Store registered users for login
  userData: {
    name: '',
    phoneNumber: '',
    age: '',
    email: '',
    primarySymptoms: '',
    duration: '',
    urgencyLevel: '',
    severity: '',
    detailedDescription: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    insuranceProvider: '',
    insurancePlan: '',
    memberId: ''
  },
  selectedProvider: null,
  bookingData: null,
  costEstimate: null,
  careSummary: null,
  upcomingAppointments: []
};

const userDataReducer = (state, action) => {
  console.log('userDataReducer called with action:', action);
  
  switch (action.type) {
    case 'SET_USER':
      console.log('SET_USER action, payload:', action.payload);
      return {
        ...state,
        user: action.payload
      };
    case 'REGISTER_USER':
      return {
        ...state,
        registeredUsers: [...state.registeredUsers, action.payload]
      };
    case 'LOGIN_USER':
      const user = state.registeredUsers.find(u => 
        u.email === action.payload.email && u.password === action.payload.password
      );
      return {
        ...state,
        user: user ? { ...user, isAuthenticated: true } : null
      };
    case 'SET_USER_DATA':
      return {
        ...state,
        userData: { ...state.userData, ...action.payload }
      };
    case 'SET_SELECTED_PROVIDER':
      return {
        ...state,
        selectedProvider: action.payload
      };
    case 'SET_BOOKING_DATA':
      return {
        ...state,
        bookingData: action.payload
      };
    case 'SET_COST_ESTIMATE':
      return {
        ...state,
        costEstimate: action.payload
      };
    case 'SET_CARE_SUMMARY':
      return {
        ...state,
        careSummary: action.payload
      };
    case 'SET_UPCOMING_APPOINTMENTS':
      return {
        ...state,
        upcomingAppointments: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null
      };
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
};

export const UserDataProvider = ({ children }) => {
  // Restore user from localStorage if present
  const persistedUser = localStorage.getItem('user');
  console.log('UserDataProvider initialized, persistedUser:', persistedUser);
  
  const [state, dispatch] = useReducer(userDataReducer, {
    ...initialState,
    user: persistedUser ? JSON.parse(persistedUser) : null
  });

  console.log('UserDataProvider state:', state);

  // Persist user to localStorage on change
  useEffect(() => {
    console.log('UserDataProvider useEffect triggered, user:', state.user);
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
      console.log('User saved to localStorage');
    } else {
      localStorage.removeItem('user');
      console.log('User removed from localStorage');
    }
  }, [state.user]);

  return (
    <UserDataContext.Provider value={{ state, dispatch }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

// BackButton component for all pages
export const BackButton = ({ style = {}, label = 'Back' }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        background: 'none',
        border: 'none',
        color: '#764ba2',
        fontWeight: 600,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        padding: '8px 0',
        ...style
      }}
      aria-label="Go back"
    >
      <span style={{ fontSize: '20px', lineHeight: 1 }}>&larr;</span> {label}
    </button>
  );
}; 