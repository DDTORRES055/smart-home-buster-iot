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

import ActionsSelect from '../../Forms/ActionsSelect'
import ConfirmDeleteModal from '../ConfirmDeleteModal'
import TimeInput from '../../TimeInput'

export default function RoutineModal({
  routineKey,
  isModalOpen,
  setIsModalOpen,
}) {
  const { routines, addRoutine, removeRoutine, updateRoutine } = useIoT()
  const [routine, setRoutine] = useState(
    routines
      ? routines[routineKey]
      : {
          name: '',
          time: {
            hour: '00',
            minutes: '00',
          },
        }
  )
  const [processing, setProcessing] = useState(false)
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (routineKey && routines) {
      setRoutine(routines[routineKey])
    } else {
      setRoutine({
        name: '',
        time: {
          hour: '00',
          minutes: '00',
        },
        actions: {
          D0: {
            deviceType: 'devices',
            modificator: 'state',
            state: false,
          },
        },
      })
    }
  }, [routineKey, routines])

  const closeModal = () => {
    setIsModalOpen(false)
    setRoutine({
      name: '',
      time: {
        hour: '00',
        minutes: '00',
      },
      actions: {
        D0: {
          deviceType: 'devices',
          modificator: 'state',
          state: false,
        },
      },
    })
  }

  const handleChangeInput = (event) => {
    setRoutine({
      ...routine,
      [event.target.name]: event.target.value,
    })
  }

  const handleChangeTime = (event) => {
    setRoutine({
      ...routine,
      time: event.target.value,
    })
  }

  const handleChangeActions = (actions) => {
    setRoutine({
      ...routine,
      actions,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setProcessing(true)
      if (routineKey) {
        await updateRoutine(
          routineKey,
          routine.name,
          routine.time,
          routine.actions
        )
      } else {
        await addRoutine(routine.name, routine.time, routine.actions)
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
    await removeRoutine(routineKey)
    setProcessing(false)
    closeModal()
  }

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {routineKey ? 'Editar rutina' : 'Crear rutina'}
        </ModalHeader>
        <ModalBody>
          <Label>
            <span>Nombre</span>
            <Input
              name='name'
              className='mt-1'
              placeholder='Jane Doe'
              value={routine?.name}
              onChange={handleChangeInput}
              required
            />
          </Label>
          <Label className='mt-4'>
            <span>Hora de activación</span>
            <TimeInput
              name='time'
              value={routine?.time ? routine.time : '00:00'}
              onChange={handleChangeTime}
              required
            />
          </Label>
          <ActionsSelect
            actions={routine?.actions}
            setActions={handleChangeActions}
          />
          {error && (
            <div className='mt-4 text-red-500 text-center'>
              <span>{error}</span>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {routineKey && (
            <Button
              type='button'
              layout='outline'
              className=' border-red-700 text-red-700 mr-2 w-full sm:w-auto dark:text-red-700'
              onClick={() => {
                setIsConfirmDeleteModalOpen(true)
              }}
            >
              Eliminar rutina
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
            htmlFor='submit-routine'
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
            <input id='submit-routine' className='w-0 h-0' type='submit' />
          </Button>
        </ModalFooter>
      </form>
      {routineKey && (
        <ConfirmDeleteModal
          label='rutina'
          name={routine?.name}
          onConfirm={handleDelete}
          isModalOpen={isConfirmDeleteModalOpen}
          setIsModalOpen={setIsConfirmDeleteModalOpen}
        />
      )}
    </Modal>
  )
}
