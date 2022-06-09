import React from 'react'

import { Button, TableCell, TableRow, Select } from '@windmill/react-ui'
import { TrashIcon } from '../../../icons'

export default function ActionSelectItem({
  value,
  state,
  deviceType,
  options,
  onChangeDevice,
  onChangeAction,
  onDelete,
}) {
  return (
    <TableRow>
      <TableCell>
        <Select className='mt-1' value={value} onChange={onChangeDevice}>
          {Object.keys(options).map((optionKey) => (
            <option key={optionKey} value={optionKey}>
              {options[optionKey].name}
            </option>
          ))}
        </Select>
      </TableCell>
      <TableCell>
        <Select className='mt-1' value={state} onChange={onChangeAction}>
          <option value='on'>
            {deviceType === 'sensor' ? 'Activar' : 'Encender'}
          </option>
          <option value='off'>
            {deviceType === 'sensor' ? 'Desactivar' : 'Apagar'}
          </option>
        </Select>
      </TableCell>
      <TableCell>
        <div className='flex items-center space-x-4'>
          <Button
            layout='link'
            size='icon'
            aria-label='Eliminar'
            onClick={onDelete}
          >
            <TrashIcon className='w-5 h-5' aria-hidden='true' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
