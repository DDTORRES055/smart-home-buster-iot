import React, { useState, useEffect } from 'react'

import { useIoT } from '../context/IoTContext'
import { useSensorPanel } from '../context/SensorPanelContext'

import DeviceCard from '../components/Cards/DeviceCard'
import PageTitle from '../components/Typography/PageTitle'

function Groups() {
  const { devices, sensors, loadingDevices, setDeviceState } = useIoT()
  const { toggleSensorPanel } = useSensorPanel()

  return (
    <>
      <PageTitle>Grupos</PageTitle>

      {/* <!-- Cards --> */}
      <div className='flex flex-wrap my-8 gap-8'>
        {Object.keys(devices)
          .filter((key) => key.startsWith('G'))
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
      </div>
    </>
  )
}

export default Groups
