// src/api/dashboard.js
import axios from 'axios';

const API_BASE = 'http://localhost:8000'; // adjust if needed

export const fetchDashboardData = async (period = 'week') => {
  const token = localStorage.getItem('token'); // assumes login stores JWT here
  const url = `${API_BASE}/dashboard?period=${encodeURIComponent(period)}`;

  const res = await axios.get(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
};
