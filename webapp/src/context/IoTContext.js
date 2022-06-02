import React, { createContext, useContext, useEffect, useState } from 'react'
import { database } from '../services/firebase/database'
import { useAuth } from '../context/AuthContext'
import { ref, onValue, child, get, set } from 'firebase/database'

const iotContext = createContext()

export const useIoT = () => {
  const context = useContext(iotContext)
  if (!context) throw new Error('There is no IoT provider')
  return context
}

export function IoTProvider({ children }) {
  const { user } = useAuth()
  const [devices, setDevices] = useState([])
  const [sensors, setSensors] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [loadingSensors, setLoadingSensors] = useState(true)

  useEffect(() => {
    if (user) {
      const devicesRef = ref(database, 'devices')
      onValue(devicesRef, (snapshot) => {
        console.log('Read devices from firebase: ', snapshot.val())
        const data = snapshot.val()
        setDevices(data)
      })

      const sensorsRef = ref(database, 'sensors')
      onValue(sensorsRef, (snapshot) => {
        console.log('Read sensors from firebase: ', snapshot.val())
        const data = snapshot.val()
        setSensors(data)
      })
    }
  }, [user])

  const setDeviceState = async (deviceId, state) => {
    const deviceRef = ref(database, `devices/${deviceId}`)
    const snapshot = await get(deviceRef)
    const device = snapshot.val()
    if (
      device.type === 'lightbulb' ||
      device.type === 'plug' ||
      device.type === 'group'
    ) {
      const deviceStateRef = ref(database, `devices/${deviceId}/state`)
      set(deviceStateRef, state)
    }
  }

  const setSensorActive = async (sensorId, active) => {
    const sensorRef = ref(database, `sensors/${sensorId}`)
    const snapshot = await get(sensorRef)
    const sensor = snapshot.val()
    if (sensor.type === 'motion') {
      const sensorActiveRef = ref(database, `sensors/${sensorId}/active`)
      set(sensorActiveRef, active)
    }
  }

  return (
    <iotContext.Provider
      value={{
        devices,
        sensors,
        loadingDevices,
        setDevices,
        setLoadingDevices,
        setDeviceState,
        setSensorActive,
      }}
    >
      {children}
    </iotContext.Provider>
  )
}
