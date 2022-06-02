import React from 'react'
import "./index.css"

export default function StatebCheckbox({ checked }) {
  return (
    <div id='state-checkbox' className='flex flex-col pt-2 w-8'>
      <input type='checkbox' checked={checked} readOnly />
    </div>
  )
}
