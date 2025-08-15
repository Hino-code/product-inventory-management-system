// src/hooks/useDashboard.js
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../api/dashboard';

// defaultPeriod can be 'week' | 'month' | 'year' | 'all'
export function useDashboard(period = 'week') {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => fetchDashboardData(period),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}
