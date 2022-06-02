import React from 'react'
import { formatWithDayOfWeek } from '../../utils/dateFormat'

export default function CameraInfo({ sensor }) {
  return (
    <>
      {Object.keys(sensor)
        .filter((key) => key.startsWith('-'))
        .reverse()
        .map((key) => (
          <div
            key={key}
            className='flex flex-col items-center w-full p-10 my-4 rounded-lg dark:bg-gray-700'
          >
            <div className='text-center text-lg text-black mb-4 dark:text-white'>
              {formatWithDayOfWeek(sensor[key].Ts)}
            </div>
            <img
              className=' rounded-lg w-full max-w-sm'
              src={`data:image/jpeg;base64, ${sensor[key].image}`}
            />
          </div>
        ))}
    </>
  )
}
