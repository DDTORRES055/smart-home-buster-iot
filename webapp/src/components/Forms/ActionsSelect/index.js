import React, { useEffect, useState } from 'react'

import { useIoT } from '../../../context/IoTContext'

import {
  Label,
  Button,
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableContainer,
} from '@windmill/react-ui'

import ActionSelectItem from './ActionSelectItem'

export default function ActionsSelect({ actions, setActions }) {
  const { devices, groups, sensors } = useIoT()
  const [options, setOptions] = useState({ ...devices, ...groups, ...sensors })

  useEffect(() => {
    setOptions({ ...devices, ...groups, ...sensors })
  }, [devices, groups, sensors])

  useEffect(() => {
    if (Object.keys(actions || {}).length === 0) {
      setActions({
        D0: {
          deviceType: 'devices',
          modificator: 'state',
          state: true,
        },
      })
    }
  }, [actions, setActions])

  const handleAdd = () => {
    let newActionKey = ''
    for (const optionKey in options) {
      if (
        Object.hasOwnProperty.call(options, optionKey) &&
        !actions[optionKey]
      ) {
        newActionKey = optionKey
        break
      }
    }
    const newAction = {
      deviceType: newActionKey.includes('D')
        ? 'devices'
        : newActionKey.includes('G')
        ? 'groups'
        : 'sensors',
      modificator: newActionKey.includes('S') ? 'active' : 'state',
      state: true,
    }
    setActions({
      ...actions,
      [newActionKey]: newAction,
    })
  }

  const handleChangeDevice = (deviceKey) => (e) => {
    const newActions = { ...actions }
    delete newActions[deviceKey]
    setActions({
      ...newActions,
      [e.target.value]: {
        deviceType: e.target.value.includes('D')
          ? 'devices'
          : e.target.value.includes('G')
          ? 'groups'
          : 'sensors',
        modificator: e.target.value.includes('S') ? 'active' : 'state',
        state: true,
      },
    })
  }

  const handleChangeAction = (deviceKey) => (e) => {
    setActions({
      ...actions,
      [deviceKey]: {
        ...actions[deviceKey],
        state: e.target.value === 'on' ? true : false,
      },
    })
  }

  const handleDelete = (deviceKey) => (e) => {
    e.preventDefault()
    const newActions = { ...actions }
    delete newActions[deviceKey]
    setActions(newActions)
  }

  return (
    <Label className='mt-4'>
      <div className='flex justify-between'>
        <span>Acciones</span>
        <Button onClick={handleAdd}>
          <span>Agregar</span>
        </Button>
      </div>
      <TableContainer className='mb-8'>
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Dispositivo</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Eliminar</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {Object.keys(actions || {}).map((key) => (
              <ActionSelectItem
                key={key}
                value={key}
                state={actions[key]?.state ? 'on' : 'off'}
                deviceType={actions[key]?.deviceType}
                onChangeDevice={handleChangeDevice(key)}
                onChangeAction={handleChangeAction(key)}
                onDelete={handleDelete(key)}
                options={options}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Label>
  )
}
