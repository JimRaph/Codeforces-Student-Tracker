import React from 'react';
import { Line } from 'react-chartjs-2';
import '../charts/ChartsSetup';

interface Contest {
  contest_date: string;
  old_rating: number;
  new_rating: number;
  contest_name: string;
}

interface Props {
  ratingData: Contest[];
}

const RatingLineChart: React.FC<Props> = ({ ratingData }) => {
  const labels = ratingData.map(c => new Date(c.contest_date).toLocaleDateString());
  const data = {
    labels,
    datasets: [
      {
        label: 'Old Rating',
        data: ratingData.map(c => c.old_rating),
        borderColor: 'rgba(99, 102, 241, 0.8)', // Indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        tension: 0.3,
        fill: false,
      },
      {
        label: 'New Rating',
        data: ratingData.map(c => c.new_rating),
        borderColor: 'rgba(16, 185, 129, 0.8)', // Emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.4)',
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Rating Over Contests' },
    },
    scales: {
      y: { beginAtZero: false },
    },
  };

  return <Line data={data} options={options} />;
};

export default RatingLineChart;
