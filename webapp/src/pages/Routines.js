import React, { useState } from 'react'

import { useIoT } from '../context/IoTContext'
import RoutineModal from '../components/Modals/RoutineModal'

import DeviceCard from '../components/Cards/DeviceCard'
import PageTitle from '../components/Typography/PageTitle'

import { Button } from '@windmill/react-ui'

function Routines() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [routineKey, setRoutineKey] = useState('')
  const { routines, setRoutineActive } = useIoT()

  function openModal(key) {
    setRoutineKey(key)
    setIsModalOpen(true)
  }

  return (
    <>
      <PageTitle>Rutinas</PageTitle>

      <div className='my-6'>
        <Button
          onClick={() => {
            openModal('')
          }}
        >
          Crear rutina
          <span className='ml-2' aria-hidden='true'>
            +
          </span>
        </Button>
      </div>

      {/* <!-- Cards --> */}
      <div className='flex flex-wrap my-8 gap-8'>
        {routines && Object.keys(routines)
          // .filter((key) => key.startsWith('R'))
          .map((key) => (
            <DeviceCard
              key={key}
              label={routines[key].name}
              type={routines[key].type}
              value={routines[key].active}
              editable={true}
              onClick={async (e) => {
                if (e.target.tagName === 'DIV') {
                  await setRoutineActive(key, !routines[key].active)
                }
              }}
              onClickGear={() => {
                openModal(key)
              }}
            />
          ))}

        <RoutineModal
          routineKey={routineKey}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      </div>
    </>
  )
}

export default Routines
