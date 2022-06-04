import React from 'react'

import { PlugSolid, LightbulbRegular } from '../../../icons'

export default function DeviceCheckbox({
  deviceKey,
  label,
  type,
  checked,
  onChange,
}) {
  return (
    <div className='flex justify-center items-center'>
      <label
        htmlFor={`${deviceKey}-checkbox`}
        className={` w-32 px-3 py-2 cursor-pointer border-solid border-2 rounded-md ${
          checked && 'border-purple-500'
        }`}
      >
        <div
          className={`flex justify-between items-center h-10 transition-colors duration-500 text-sm ${
            checked && ' text-purple-500'
          }`}
        >
          <div>{label}</div>
          <div className='ml-4 w-6'>
            {type === 'plug' && <PlugSolid />}
            {type === 'lightbulb' && <LightbulbRegular />}
          </div>
        </div>
      </label>
      <input
        id={`${deviceKey}-checkbox`}
        type='checkbox'
        value={deviceKey}
        checked={checked}
        onChange={onChange}
        className=' w-0 h-0 opacity-0'
      />
    </div>
  )
}
