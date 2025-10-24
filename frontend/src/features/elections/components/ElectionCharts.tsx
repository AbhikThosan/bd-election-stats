import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { Election } from '../slices/electionsApiSlice';

// Dynamically import Chart component to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading charts...</div>
});

interface ElectionChartsProps {
  election: Election;
}

export const ElectionCharts: React.FC<ElectionChartsProps> = ({ election }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading charts...</div>
      </div>
    );
  }

  if (!election.participant_details || election.participant_details.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No participant data available for charts</div>
      </div>
    );
  }

  // Vote Distribution Pie Chart
  const votePieOptions: ApexOptions = {
    chart: {
      type: 'pie',
      height: 350,
    },
    title: {
      text: 'Vote Distribution by Party',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
      },
    },
    labels: election.participant_details.map(p => p.party),
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: string, opts: any) {
        return opts.w.config.series[opts.seriesIndex] + ' (' + val + '%)';
      },
    },
    tooltip: {
      y: {
        formatter: function (value: number) {
          return value.toLocaleString() + ' votes';
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const votePieSeries = election.participant_details.map(p => p.vote_obtained);

  // Seat Distribution Bar Chart
  const seatBarOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    title: {
      text: 'Seats Won by Party',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
      },
    },
    xaxis: {
      categories: election.participant_details.map(p => p.party),
      labels: {
        style: {
          fontSize: '12px',
        },
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: 'Number of Seats',
      },
    },
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toString();
      },
    },
    tooltip: {
      y: {
        formatter: function (value: number) {
          return value + ' seats';
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          xaxis: {
            labels: {
              rotate: -90,
            },
          },
        },
      },
    ],
  };

  const seatBarSeries = [
    {
      name: 'Seats Won',
      data: election.participant_details.map(p => p.seat_obtain),
    },
  ];

  // Vote Percentage Comparison Chart
  const voteComparisonOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    title: {
      text: 'Vote Percentage Comparison',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
      },
    },
    xaxis: {
      categories: election.participant_details.map(p => p.party),
      labels: {
        style: {
          fontSize: '12px',
        },
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: 'Vote Percentage (%)',
      },
      max: 100,
    },
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(2) + '%';
      },
    },
    tooltip: {
      y: {
        formatter: function (value: number) {
          return value.toFixed(2) + '%';
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          xaxis: {
            labels: {
              rotate: -90,
            },
          },
        },
      },
    ],
  };

  const voteComparisonSeries = [
    {
      name: 'Vote Percentage',
      data: election.participant_details.map(p => p.percent_vote_obtain),
    },
  ];

  // Overall Statistics Donut Chart
  const overallStatsOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 300,
    },
    title: {
      text: 'Election Overview',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
      },
    },
    labels: ['Valid Votes', 'Cancelled Votes'],
    colors: ['#52c41a', '#faad14'],
    dataLabels: {
      enabled: true,
      formatter: function (val: string) {
        return val + '%';
      },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    tooltip: {
      y: {
        formatter: function (value: number, { seriesIndex }: any) {
          const labels = ['Valid Votes', 'Cancelled Votes'];
          const totals = [election.total_valid_vote, election.cancelled_vote];
          return totals[seriesIndex]?.toLocaleString() + ' votes (' + value + '%)';
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250,
          },
        },
      },
    ],
  };

  const overallStatsSeries = [
    election.percent_valid_vote || 0,
    election.percent_cancelled_vote || 0,
  ];

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vote Distribution Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <Chart
            options={votePieOptions}
            series={votePieSeries}
            type="pie"
            height={350}
          />
        </div>

        {/* Seat Distribution Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <Chart
            options={seatBarOptions}
            series={seatBarSeries}
            type="bar"
            height={350}
          />
        </div>

        {/* Vote Percentage Comparison */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <Chart
            options={voteComparisonOptions}
            series={voteComparisonSeries}
            type="bar"
            height={350}
          />
        </div>

        {/* Overall Statistics Donut Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <Chart
            options={overallStatsOptions}
            series={overallStatsSeries}
            type="donut"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};
