import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../charts/ChartsSetup';

interface Props {
  problemsPerRatingBucket: Record<string, number>;
}

const ProblemsBarChart: React.FC<Props> = ({ problemsPerRatingBucket }) => {
  const labels = Object.keys(problemsPerRatingBucket).sort((a, b) => {
    // Sort buckets by their numeric start range
    const aStart = parseInt(a.split('-')[0]);
    const bStart = parseInt(b.split('-')[0]);
    return aStart - bStart;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Problems Solved',
        data: labels.map(label => problemsPerRatingBucket[label]),
        backgroundColor: 'rgba(24, 24, 27, 0.8)', // zinc-900
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Problems Solved per Rating Bucket' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-50 p-4 rounded shadow">
      <Bar data={data} options={options} />
    </div>
  );

};

export default ProblemsBarChart;
