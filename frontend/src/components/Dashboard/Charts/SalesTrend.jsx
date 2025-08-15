import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js';
import CountUp from 'react-countup';
import { formatPHP } from '../../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function SalesTrend({ data }) {
  const trendData = data || [];

  // Totals for KPI
  const totalRevenue = trendData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrders = trendData.reduce((sum, d) => sum + (d.orders || 0), 0);

  // Show last 7 periods
  const last7 = trendData.slice(-7);

  const chartData = {
    labels: last7.map(d => new Date(d.date).toLocaleDateString('en-PH', { weekday: 'short' })),
    datasets: [
      {
        label: 'Revenue',
        data: last7.map(d => d.revenue),
        backgroundColor: '#6366F1',
        borderRadius: 4,
        barPercentage: 0.6
      },
      {
        label: 'Orders',
        data: last7.map(d => d.orders),
        backgroundColor: '#10B981',
        borderRadius: 4,
        barPercentage: 0.6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200 },
    plugins: {
      legend: { display: false }, // hide legend for sparkline style
      tooltip: {
        callbacks: {
          label: context =>
            context.dataset.label === 'Revenue'
              ? `${context.dataset.label}: ${formatPHP(context.raw)}`
              : `${context.dataset.label}: ${context.raw}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { display: false } },
      y: { grid: { display: false }, ticks: { display: false } }
    },
    elements: { bar: { borderSkipped: false } }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* KPI Numbers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
        <div className="text-center">
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366F1' }}>
            <CountUp end={totalRevenue} duration={1.5} separator="," prefix="₱" />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Revenue</div>
        </div>
        <div className="text-center">
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>
            <CountUp end={totalOrders} duration={1.5} separator="," />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Orders</div>
        </div>
      </div>

      {/* Sparkline Mini Bar Chart */}
      <div style={{ height: '100px', padding: '0 8px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
