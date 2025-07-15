import React from "react";
import Chart from "react-apexcharts";

const PaymentClientStateChart = ({ cuotas }) => {
  const estados = ["Pagadas", "Pendientes", "Expiradas", "Incompletas"];

  const data = {
    Pagadas: cuotas.pagadas || 0,
    Pendientes: cuotas.pendientes || 0,
    Expiradas: cuotas.expiradas || 0,
    Incompletas: cuotas.incompletas || 0,
  };



  const series = Object.values(data);

  const optionsPie = {
    labels: estados,
    chart: {
      type: 'donut',
       width: 200
    },
    legend: {
          position: 'bottom'
        },
      
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    colors: ['#00e396', '#feb019', '#ff4560', '#775dd0']
  };

  

  const optionsBar = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        distributed: true,
        horizontal: false,
        columnWidth: '55%',
      }
    },
    dataLabels: {
      enabled: true
    },
    xaxis: {
      categories: estados
    },
    colors: ['#00e396', '#feb019', '#ff4560', '#775dd0']
  };

  return (
    <div className="flex items-center justify-center">
      {/* <h3>Estado de Cuotas - Gráfico Circular</h3> */}
      <Chart options={optionsPie} series={series} type="donut" width="380" />

      {/* <h3>Estado de Cuotas - Gráfico de Barras</h3>
      <Chart options={optionsBar} series={[{ data: series }]} type="bar" height={350} /> */}
    </div>
  );
};

export default PaymentClientStateChart;
