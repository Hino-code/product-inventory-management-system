import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import CountUp from 'react-countup';

ChartJS.register(ArcElement, Tooltip);

export default function ProductStatus({ totalProducts = 0, lowStock = 0 }) {
  const inStock = totalProducts - lowStock;
  const inStockPercent = totalProducts > 0 ? Math.round((inStock / totalProducts) * 100) : 0;

  const data = {
    labels: ['In Stock', 'Low Stock'],
    datasets: [
      {
        data: [inStock, lowStock],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderWidth: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false }, // hide legend for KPI look
      tooltip: {
        callbacks: {
          label: context => `${context.label}: ${context.raw}`
        }
      }
    },
    animation: { animateRotate: true, animateScale: true }
  };

  return (
    <div style={{ position: 'relative', height: '120px', width: '120px', margin: '0 auto' }}>
      <Doughnut data={data} options={options} />

      {/* Center KPI */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10B981' }}>
          <CountUp end={inStockPercent} duration={1.5} />%
        </div>
        <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '2px' }}>
          In Stock
        </div>
      </div>
    </div>
  );
}
