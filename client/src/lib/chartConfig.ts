import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(22, 27, 34, 0.95)',
      titleColor: '#F0F6FC',
      bodyColor: '#8B949E',
      borderColor: 'rgba(0, 217, 255, 0.3)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(0, 217, 255, 0.1)',
        borderColor: 'rgba(0, 217, 255, 0.2)',
      },
      ticks: {
        color: '#8B949E',
        font: {
          family: 'Inter',
          size: 12,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 217, 255, 0.1)',
        borderColor: 'rgba(0, 217, 255, 0.2)',
      },
      ticks: {
        color: '#8B949E',
        font: {
          family: 'Inter',
          size: 12,
        },
      },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4,
    },
    line: {
      tension: 0.4,
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
};

export const assetColors = {
  GOLD: {
    primary: '#FFD700',
    secondary: 'rgba(255, 215, 0, 0.2)',
    gradient: 'from-yellow-500 to-orange-500',
  },
  SILVER: {
    primary: '#C0C0C0',
    secondary: 'rgba(192, 192, 192, 0.2)',
    gradient: 'from-gray-400 to-gray-600',
  },
  OIL: {
    primary: '#FF6B35',
    secondary: 'rgba(255, 107, 53, 0.2)',
    gradient: 'from-orange-500 to-red-500',
  },
  BTC: {
    primary: '#F7931A',
    secondary: 'rgba(247, 147, 26, 0.2)',
    gradient: 'from-purple-500 to-pink-500',
  },
};

export function createLineChartData(data: any[], asset: string) {
  const colors = assetColors[asset as keyof typeof assetColors] || assetColors.GOLD;
  
  return {
    labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: `${asset} Price`,
        data: data.map(d => parseFloat(d.close)),
        borderColor: colors.primary,
        backgroundColor: colors.secondary,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
}

export function createBarChartData(data: number[], labels: string[]) {
  return {
    labels,
    datasets: [
      {
        label: 'Returns %',
        data,
        backgroundColor: [
          'rgba(0, 217, 255, 0.3)',
          'rgba(0, 255, 136, 0.3)',
          'rgba(255, 167, 38, 0.3)',
          'rgba(138, 43, 226, 0.3)',
        ],
        borderColor: [
          '#00D9FF',
          '#00FF88',
          '#FFA726',
          '#8A2BE2',
        ],
        borderWidth: 1,
      },
    ],
  };
}
