import React from 'react'
import SensorPanel from '../components/SensorPanel'

function Main({ children }) {

  return (
    <main className="h-full overflow-y-auto">
      <div className="container grid px-6 mx-auto">{children}</div>
      <SensorPanel />
    </main>
  )
}

export default Main
