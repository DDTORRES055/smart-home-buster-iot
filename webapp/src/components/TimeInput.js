import * as React from 'react'

export default function TimeInput({ name, value, onChange, required }) {
  return (
    <div className='flex flex-col items-center'>
      <input
        className='block w-full text-sm focus:outline-none dark:text-gray-100 form-input leading-5 focus:border-purple-400 dark:border-gray-600 focus:shadow-outline-purple dark:focus:border-gray-600 dark:focus:shadow-outline-gray dark:bg-gray-500 mt-1'
        type='time'
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  )
}
