import React from 'react'

import Thermometer from 'react-thermometer-component'
import { Line } from 'react-chartjs-2'
import ChartLegend from '../Chart/ChartLegend'
import ChartCard from '../Chart/ChartCard'
import { lineOptions, lineLegends } from '../../utils/data/chartsData'
import { dateFormat } from '../../utils/dateFormat'

export default function TemperatureSensorInfo({ sensor }) {
  const data = {
    ...lineOptions,
    data: {
      labels: Object.keys(sensor.data)
        .map((d) => sensor.data[d].Ts)
        .slice(-7)
        .map((d) => dateFormat(d)),
      datasets: [
        {
          ...lineOptions.data.datasets[0],
          data: Object.keys(sensor.data)
            .map((d) => sensor.data[d].temperature)
            .slice(-7),
        },
      ],
    },
  }
  console.log(data)

  return (
    <div className='flex flex-col items-center my-4'>
      <ChartCard title='Temperatura a través del tiempo'>
        <Line {...data} />
        <ChartLegend legends={lineLegends} />
      </ChartCard>
      <h2 className='font-bold italic text-black text-2xl dark:text-white'>
        Temperatura actual:
      </h2>
      <div className='mt-4'>
        <Thermometer
          theme='dark'
          value={sensor.data[Object.keys(sensor.data).slice(-1)].temperature}
          max='60'
          steps='3'
          format='°C'
          size='normal'
          height='200'
        />
      </div>
      <h2 className='font-bold italic text-black text-3xl dark:text-white'>
        {sensor.data[Object.keys(sensor.data).slice(-1)].temperature}°C
      </h2>
    </div>
  )
}
