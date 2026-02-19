// frontend/src/components/charts/ChartSetup.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  registerables
} from 'chart.js';

// Register ALL Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  ...registerables
);

// Also register arc element specifically for pie/doughnut charts
ChartJS.register(ArcElement);

console.log('✅ Chart.js components registered successfully');

export default ChartJS;