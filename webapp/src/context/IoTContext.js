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
  const [loadingDevices, setLoadingDevices] = useState(true)

  useEffect(() => {
    if (user) {
      const devicesRef = ref(database, 'devices')
      onValue(devicesRef, (snapshot) => {
        console.log('Read devices from firebase: ', snapshot.val())
        const data = snapshot.val()
        setDevices(data)
      })
    }
  }, [user])

  const setDeviceState = async (deviceId, state) => {
    const deviceRef = ref(database, `devices/${deviceId}`)
    const snapshot = await get(deviceRef)
    const device = snapshot.val()
    if (device.type === 'lightbulb' || device.type === 'plug') {
      const deviceStateRef = ref(database, `devices/${deviceId}/state`)
      set(deviceStateRef, state)
    }
  }

  return (
    <iotContext.Provider
      value={{
        devices,
        loadingDevices,
        setDevices,
        setLoadingDevices,
        setDeviceState,
      }}
    >
      {children}
    </iotContext.Provider>
  )
}
