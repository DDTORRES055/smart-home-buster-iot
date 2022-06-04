import React, { useEffect, useState } from 'react'

import { useIoT } from '../../../context/IoTContext'

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
} from '@windmill/react-ui'

import { Spinner } from '../../../icons'

import DeviceCheckbox from '../../Forms/DeviceCheckbox'
import ConfirmDeleteModal from '../ConfirmDeleteModal'

export default function GroupModal({ groupKey, isModalOpen, setIsModalOpen }) {
  const { devices, groups, addGroup, removeGroup, updateGroup } = useIoT()
  const [group, setGroup] = useState(
    groups[groupKey] || {
      name: '',
      devices: [],
    }
  )
  const [processing, setProcessing] = useState(false)
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (groupKey) {
      setGroup(groups[groupKey])
    } else {
      setGroup({
        name: '',
        devices: [],
      })
    }
  }, [groupKey, groups])

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleChangeCheckbox = (event) => {
    const { value, checked } = event.target
    const oldDevices = group?.devices || []
    if (checked) {
      setGroup({
        ...group,
        devices: [...oldDevices, value],
      })
    } else {
      setGroup({
        ...group,
        devices: oldDevices.filter((device) => device !== value),
      })
    }
  }

  const handleChangeInput = (event) => {
    setGroup({
      ...group,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setProcessing(true)
      if (groupKey) {
        await updateGroup(groupKey, group.name, group.devices)
      } else {
        await addGroup(group.name, group.devices)
      }
      closeModal()
    } catch (error) {
      setError(error.message)
      setTimeout(() => {
        setError('')
      }, 3000)
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    await removeGroup(groupKey)
    setProcessing(false)
    closeModal()
  }

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>{groupKey ? 'Editar grupo' : 'Crear grupo'}</ModalHeader>
        <ModalBody>
          <Label>
            <span>Nombre</span>
            <Input
              name='name'
              className='mt-1'
              placeholder='Jane Doe'
              value={group?.name}
              onChange={handleChangeInput}
              required
            />
          </Label>
          <div className='mt-4'>
            <span>Dispositivos</span>
            <div className='grid gap-8 grid-cols-3 mt-2'>
              {Object.keys(devices || {})
                .filter((key) => key.startsWith('D'))
                .map((key) => (
                  <DeviceCheckbox
                    key={key}
                    deviceKey={key}
                    label={devices[key].name}
                    type={devices[key].type}
                    checked={group?.devices?.includes(key)}
                    onChange={handleChangeCheckbox}
                  />
                ))}
            </div>
          </div>
          {error && (
            <div className='mt-4 text-red-500 text-center'>
              <span>{error}</span>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {groupKey && (
            <Button
              type='button'
              layout='outline'
              className=' border-red-700 text-red-700 mr-2 dark:text-red-700'
              onClick={() => {
                setIsConfirmDeleteModalOpen(true)
              }}
            >
              Eliminar grupo
            </Button>
          )}
          <Button
            className='w-full sm:w-auto'
            layout='outline'
            onClick={closeModal}
          >
            Cancelar
          </Button>
          <Button
            tag='label'
            htmlFor='submit-group'
            className='w-full sm:w-auto'
            disabled={processing}
          >
            {!processing ? (
              'Guardar'
            ) : (
              <>
                <span className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'>
                  <Spinner />
                </span>
                Procesando
              </>
            )}
            <input id='submit-group' className='w-0 h-0' type='submit' />
          </Button>
        </ModalFooter>
      </form>
      {groupKey && (
        <ConfirmDeleteModal
          name={group?.name}
          onConfirm={handleDelete}
          isModalOpen={isConfirmDeleteModalOpen}
          setIsModalOpen={setIsConfirmDeleteModalOpen}
        />
      )}
    </Modal>
  )
}
