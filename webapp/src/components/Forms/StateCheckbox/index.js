import React from 'react'
import './index.css'

export default function StatebCheckbox({ checked }) {
  return <input type='checkbox' checked={checked} readOnly />
}
