// Utility for authenticated fetch with automatic token refresh

export async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem('access_token');
  let refreshToken = localStorage.getItem('refresh_token');

  // Add Authorization header
  options.headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': options.headers?.['Content-Type'] || 'application/json',
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Try to refresh the token
    const refreshRes = await fetch('http://127.0.0.1:8000/api/users/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Retry the original request with the new access token
      options.headers['Authorization'] = `Bearer ${data.access_token}`;
      response = await fetch(url, options);
    } else {
      // Refresh failed, force logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
} 