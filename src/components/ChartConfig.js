import { Chart, registerables } from 'chart.js';

// Register the components needed for the charts
Chart.register(...registerables);

export default Chart; 