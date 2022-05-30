import React, { useState, useEffect } from 'react'

import { useIoT } from '../context/IoTContext'

import PageTitle from '../components/Typography/PageTitle'

function Routines() {
  const { devices, loadingDevices, setDeviceState } = useIoT()

  return (
    <>
      <PageTitle>Rutinas</PageTitle>
    </>
  )
}

export default Routines
