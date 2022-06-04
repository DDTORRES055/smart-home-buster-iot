import React, { createContext, useContext, useEffect, useState } from 'react'
import { database } from '../services/firebase/database'
import { useAuth } from '../context/AuthContext'
import {
  ref,
  onValue,
  child,
  get,
  set,
  remove,
  update,
} from 'firebase/database'

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
  const [groups, setGroups] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [loadingSensors, setLoadingSensors] = useState(true)
  const [loadingGroups, setLoadingGroups] = useState(true)

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

      const groupsRef = ref(database, 'groups')
      onValue(groupsRef, (snapshot) => {
        console.log('Read groups from firebase: ', snapshot.val())
        const data = snapshot.val()
        setGroups(data)
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
      await set(deviceStateRef, state)
    }
  }

  const setSensorActive = async (sensorId, active) => {
    const sensorRef = ref(database, `sensors/${sensorId}`)
    const snapshot = await get(sensorRef)
    const sensor = snapshot.val()
    if (sensor.type === 'motion') {
      const sensorActiveRef = ref(database, `sensors/${sensorId}/active`)
      await set(sensorActiveRef, active)
    }
  }

  const setGroupState = async (groupId, state) => {
    const groupRef = ref(database, `groups/${groupId}`)
    const snapshot = await get(groupRef)
    const group = snapshot.val()
    if (group.type === 'group') {
      const groupStateRef = ref(database, `groups/${groupId}/state`)
      await set(groupStateRef, state)
      for (const device of group.devices) {
        await setDeviceState(device, state)
      }
    }
  }

  const addGroup = async (name, devices) => {
    if(!name?.trim()) throw new Error('Debes ponerle un nombre al grupo')
    if(!devices?.length) throw new Error('Debes seleccionar al menos un dispositivo')
    const groupRef = ref(database, `groups`)
    const snapshot = await get(groupRef)
    const groups = snapshot.val()
    const groupId = Number(Object.keys(groups).at(-1).slice(1)) + 1
    const group = {
      name,
      type: 'group',
      devices,
      state: false,
    }
    await set(groupRef, { ...groups, ["G" + groupId]: group })
  }

  const removeGroup = async (groupId) => {
    const groupRef = ref(database, `groups/${groupId}`)
    await remove(groupRef)
  }

  const updateGroup = async (groupId, name, devices) => {
    if(!name?.trim()) throw new Error('Debes ponerle un nombre al grupo')
    if(!devices?.length) throw new Error('Debes seleccionar al menos un dispositivo')
    const groupRef = ref(database, `groups/${groupId}`)
    const snapshot = await get(groupRef)
    const group = snapshot.val()
    const updatedGroup = {
      ...group,
      name,
      devices,
    }
    await update(groupRef, updatedGroup)
  }

  return (
    <iotContext.Provider
      value={{
        devices,
        sensors,
        groups,
        loadingDevices,
        setDevices,
        setLoadingDevices,
        setDeviceState,
        setSensorActive,
        setGroupState,
        addGroup,
        removeGroup,
        updateGroup,
      }}
    >
      {children}
    </iotContext.Provider>
  )
}
