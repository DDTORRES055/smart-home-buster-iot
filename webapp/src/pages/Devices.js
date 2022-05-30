import React, { useState, useEffect } from 'react'

import { useIoT } from '../context/IoTContext'

import DeviceCard from '../components/Cards/DeviceCard'
import PageTitle from '../components/Typography/PageTitle'

function Dashboard() {
  const { devices, loadingDevices, setDeviceState } = useIoT()

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
      </div>
    </>
  )
}

export default Dashboard
