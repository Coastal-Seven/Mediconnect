# Smart Care Routing Backend

**IMPORTANT:**

To enable JWT authentication and database connection, you must create a `.env` file in the `backend/` directory with the following content:

```
SECRET_KEY=your_super_secret_key
REFRESH_SECRET_KEY=your_refresh_super_secret_key
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=smartcare
```

Replace the values with your actual MongoDB connection string and database name. Restart your backend server after making changes to this file.

---

A FastAPI-based backend for the Smart Care Routing application with JWT authentication and insurance plan management.

## Features

### JWT Authentication
- **Access Tokens**: 24-hour lifetime
- **Refresh Tokens**: 7-day lifetime
- Secure password hashing using SHA256
- Token-based user authentication for protected routes

### Insurance Plans Management
- Comprehensive insurance plan data model
- CRUD operations for insurance plans
- Support for different plan types (PPO, HMO, EPO, POS)
- Detailed coverage and cost information

### Provider Management
- Provider matching based on symptoms, insurance, and location
- Provider details stored only when booking appointments
- Secure provider information retrieval

### Booking System
- Appointment booking with provider details storage
- Booking confirmation and management
- User-specific booking access control

## API Endpoints

### Authentication (`/api/users`)
- `POST /register` - User registration
- `POST /login` - User login (returns access + refresh tokens)
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user info
- `GET /{user_id}` - Get user by ID

### Insurance Plans (`/api/insurance`)
- `GET /` - List all insurance plans (with optional filtering)
- `GET /{plan_id}` - Get specific insurance plan
- `POST /` - Create new insurance plan (authenticated)
- `PUT /{plan_id}` - Update insurance plan (authenticated)
- `DELETE /{plan_id}` - Delete insurance plan (authenticated)
- `GET /providers/{provider_name}` - Get plans by provider

### Providers (`/api/providers`)
- `GET /` - List all providers
- `GET /match/` - Match providers based on criteria
- `GET /{provider_id}` - Get specific provider

### Bookings (`/api/bookings`)
- `POST /` - Create new booking (authenticated)
- `PUT /confirm` - Confirm booking (authenticated)
- `GET /user/{user_id}` - Get user bookings (authenticated)
- `GET /provider/{provider_id}` - Get provider bookings
- `DELETE /cancel/{booking_id}` - Cancel booking (authenticated)
- `PUT /reschedule/{booking_id}` - Reschedule booking (authenticated)

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=smartcare
SECRET_KEY=your-secret-key-here
REFRESH_SECRET_KEY=your-refresh-secret-key-here
```

## Environment Variables for JWT Authentication

To enable JWT authentication, create a `.env` file in the `backend/` directory with the following content:

```
SECRET_KEY=your_super_secret_key
REFRESH_SECRET_KEY=your_refresh_super_secret_key
```

These keys are used for signing and verifying JWT tokens. The backend will automatically read these variables from the environment.

You can use any strong random string for these keys.

## Installation and Setup

1. Install dependencies:

```bash
# If using venv (recommended)
python -m venv myenv
myenv\Scripts\activate  # On Windows
# Or: source myenv/bin/activate  # On Mac/Linux
pip install -r requirements.txt
```

2. Set up your `.env` file as described above.

3. Start the backend server:

```bash
uvicorn main:app --reload
```

- The API will be available at `http://localhost:8000` by default.
- Interactive API docs: `http://localhost:8000/docs`

## Running Tests

If you have tests set up (e.g., with pytest), run:

```bash
pytest
```

## Troubleshooting

- **MongoDB Connection Errors:** Ensure MongoDB is running and the URI in your `.env` is correct.
- **Missing Dependencies:** Double-check you have activated your virtual environment and installed all requirements.
- **JWT Errors:** Make sure your `SECRET_KEY` and `REFRESH_SECRET_KEY` are set and strong.

## Contact

For questions or support, please open an issue or contact the project maintainer.