import React from 'react'
import "./index.css"

export default function LightbulbCheckbox({ checked }) {
  return (
    <div id='lightbulb-checkbox' className='flex flex-col pt-2 w-8'>
      <input className='l transform -rotate-90' type='checkbox' checked={checked} readOnly />
    </div>
  )
}
