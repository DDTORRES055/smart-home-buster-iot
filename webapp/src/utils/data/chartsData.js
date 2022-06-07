export const lineLegends = [
  { title: 'Temperatura', color: 'bg-red-600' },
]

export const lineOptions = {
  data: {
    datasets: [
      {
        label: 'Temperatura',
        backgroundColor: '#e02424',
        borderColor: '#e02424',
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Tiempo',
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Temperatura',
        },
      },
      xAxes: [{display: false}],
    },
  },
  legend: {
    display: false,
  },
}
