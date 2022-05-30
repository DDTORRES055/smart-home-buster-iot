import React from 'react'
import {
  TemperatureHalfSolid,
  PersonWalkingSolid,
  PlugSolid,
  LightbulbRegular,
  CameraSolid,
} from '../../icons'
import LightbulbCheckbox from '../Forms/LightbulbCheckbox'
import StateCheckbox from '../Forms/StateCheckbox'

export default function DeviceCard({ label, type, value, onClick }) {
  return (
    <div
      className='flex w-32 h-32 p-3 justify-between rounded-lg shadow-xl bg-white dark:bg-gray-800 cursor-pointer'
      onClick={onClick}
    >
      <div className='flex flex-col justify-between text-black dark:text-white'>
        <div className=' w-6'>
          {type === 'temperature' && <TemperatureHalfSolid />}
          {type === 'motion' && <PersonWalkingSolid />}
          {type === 'plug' && <PlugSolid />}
          {type === 'lightbulb' && <LightbulbRegular />}
          {type === 'camera' && <CameraSolid />}
        </div>
        <div className='text-sm'>{label}</div>
      </div>
      {type === 'lightbulb' && <LightbulbCheckbox checked={value} />}
      {(type === 'plug' || type === 'group') && (
        <StateCheckbox checked={value} />
      )}
    </div>
  )
}
