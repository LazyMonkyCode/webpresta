import React from 'react';
import Chart from 'react-apexcharts';

function LoanChart({
  type = 'area',             // area, bar, donut, line, etc.
  title = 'Loan Overview',
  categories = [],           // eje X (e.g., ['Jan', 'Feb', 'Mar'])
  series = [],               // datos (e.g., [{ name: 'Pagos', data: [10, 20, 15] }])
  height = 300,
}) {
  const options = {
    chart: {
      id: 'loan-chart',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: type === 'area' || type === 'line' ? 'smooth' : 'straight',
    },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      labels: {
        formatter: val => `$${val}`,
      },
    },
    colors: ['#3b82f6', '#10b981'], // azul y verde
    fill: {
      opacity: type === 'area' ? 0.4 : 1,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: {
      y: {
        formatter: val => `$${val}`,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <Chart options={options} series={series} type={type} height={height} />
    </div>
  );
}

export default LoanChart;
