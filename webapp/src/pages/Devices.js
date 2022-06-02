import React, { useState, useEffect } from 'react'

import { useIoT } from '../context/IoTContext'
import { useSensorPanel } from '../context/SensorPanelContext'

import DeviceCard from '../components/Cards/DeviceCard'
import PageTitle from '../components/Typography/PageTitle'

function Dashboard() {
  const { devices, sensors, loadingDevices, setDeviceState, setSensorActive } =
    useIoT()
  const { toggleSensorPanel } = useSensorPanel()

  return (
    <>
      <PageTitle>Dispositivos</PageTitle>

      {/* <!-- Cards --> */}
      <div className='flex flex-wrap my-8 gap-8'>
        {Object.keys(devices)
          .filter((key) => key.startsWith('D'))
          .map((key) => (
            <DeviceCard
              key={key}
              label={devices[key].name}
              type={devices[key].type}
              value={devices[key].state}
              onClick={async () =>
                await setDeviceState(key, !devices[key].state)
              }
            />
          ))}

        {Object.keys(sensors).map((key) => (
          <DeviceCard
            key={key}
            label={sensors[key].name}
            type={sensors[key].type}
            value={sensors[key].active}
            onClick={async () =>
              sensors[key].type === 'motion'
                ? await setSensorActive(key, !sensors[key].active)
                : toggleSensorPanel(sensors[key])
            }
          />
        ))}
      </div>
    </>
  )
}

export default Dashboard
