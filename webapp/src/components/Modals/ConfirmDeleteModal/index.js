import React, {useState} from 'react'

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@windmill/react-ui'

import { Spinner } from '../../../icons'

export default function ConfirmDeleteModal({ label, name, onConfirm, isModalOpen, setIsModalOpen }) {
  const [processing, setProcessing] = useState(false)

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          Eliminar {label}
        </ModalHeader>
        <ModalBody>
          <p>
            ¿Estás seguro que quieres eliminar <strong>{name}</strong>?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            className='w-full sm:w-auto'
            layout='outline'
            onClick={closeModal}
          >
            Cancelar
          </Button>
          <Button className='w-full sm:w-auto bg-red-600' disabled={processing} onClick={async()=>{
            setProcessing(true)
            await onConfirm()
            setProcessing(false)
            closeModal()
          }}>
            {!processing ? (
              'Si, eliminar'
            ) : (
              <>
                <span className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'>
                  <Spinner />
                </span>
                Processing
              </>
            )}
          </Button>
        </ModalFooter>
    </Modal>
  )
}
