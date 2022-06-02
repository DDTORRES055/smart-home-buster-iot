import React from 'react'

import { Transition, Backdrop } from '@windmill/react-ui'

import { useSensorPanel } from '../../context/SensorPanelContext'

import { Button } from '@windmill/react-ui'
import CameraInfo from './CameraInfo'
import MotionSensorInfo from './MotionSensorInfo'
import TemperatureSensorInfo from './TemperatureSensorInfo'
import { XMarkSolid } from '../../icons'

function SensorPanel() {
  const { isSensorPanelOpen, sensorSelected, closeSensorPanel } =
    useSensorPanel()

  return (
    <Transition show={isSensorPanelOpen}>
      <>
        <Transition
          enter='transition ease-in-out duration-150'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='transition ease-in-out duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <Backdrop onClick={closeSensorPanel} />
        </Transition>

        <Transition
          enter='transition ease-in-out duration-150'
          enterFrom='opacity-0 transform translate-x-full'
          enterTo='opacity-100'
          leave='transition ease-in-out duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0 transform translate-x-full'
        >
          <div className='fixed inset-y-0 right-0 z-50 flex flex-col flex-shrink-0 min-w-64 max-w-full md:mt-16 overflow-y-hidden bg-white dark:bg-gray-800'>
            <div className='flex justify-end mx-12 my-6'>
              <Button
                icon={XMarkSolid}
                layout='outline'
                aria-label='Cerrar'
                onClick={closeSensorPanel}
              />
            </div>

            <div className='flex flex-col items-center px-4 overflow-auto'>
              <h2 className='text-4xl text-black my-4 dark:text-white'>
                {sensorSelected?.name}
              </h2>
              {sensorSelected && sensorSelected.type === 'camera' && (
                <CameraInfo sensor={sensorSelected} />
              )}
              {sensorSelected && sensorSelected.type === 'motion' && (
                <MotionSensorInfo />
              )}
              {sensorSelected && sensorSelected.type === 'temperature' && (
                <TemperatureSensorInfo />
              )}
            </div>
          </div>
        </Transition>
      </>
    </Transition>
  )
}

export default SensorPanel
