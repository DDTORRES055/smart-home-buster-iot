import React, { useState, useMemo, useContext } from 'react'

// create context
export const sensorPanelContext = React.createContext()

export const useSensorPanel = () => {
  const context = useContext(sensorPanelContext)
  if (!context) throw new Error('There is no SensorPanel provider')
  return context
}

export const SensorPanelProvider = ({ children }) => {
  const [isSensorPanelOpen, setIsSensorPanelOpen] = useState(false)
  const [sensorSelected, setSensorSelected] = useState(null)

  function toggleSensorPanel( sensorKey ) {
    setIsSensorPanelOpen(!isSensorPanelOpen)
    setSensorSelected(sensorKey)
  }

  function closeSensorPanel() {
    setIsSensorPanelOpen(false)
    console.log('closeSensorPanel');
  }

  const value = useMemo(
    () => ({
      sensorSelected,
      isSensorPanelOpen,
      toggleSensorPanel,
      closeSensorPanel,
    }),
    [isSensorPanelOpen]
  )

  return <sensorPanelContext.Provider value={value}>{children}</sensorPanelContext.Provider>
}
