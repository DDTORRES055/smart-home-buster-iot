import React, { useState, useEffect } from 'react'

import { useIoT } from '../context/IoTContext'
import GroupModal from '../components/Modals/GroupModal'

import DeviceCard from '../components/Cards/DeviceCard'
import PageTitle from '../components/Typography/PageTitle'

import { Button } from '@windmill/react-ui'

function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [groupKey, setGroupKey] = useState('')
  const { devices, groups, loadingDevices, setDeviceState, setGroupState } =
    useIoT()

  function openModal(key) {
    setGroupKey(key)
    setIsModalOpen(true)
  }

  return (
    <>
      <PageTitle>Grupos</PageTitle>

      <div className='my-6'>
        <Button
          onClick={() => {
            openModal('')
          }}
        >
          Crear grupo
          <span className='ml-2' aria-hidden='true'>
            +
          </span>
        </Button>
      </div>

      {/* <!-- Cards --> */}
      <div className='flex flex-wrap my-8 gap-8'>
        {Object.keys(devices)
          .filter((key) => key.startsWith('G'))
          .map((key) => (
            <DeviceCard
              key={key}
              label={devices[key].name}
              type={devices[key].type}
              value={devices[key].state}
              onClick={async () =>
                await setDeviceState(key, !devices[key].state)
              }
            />
          ))}

        {Object.keys(groups)
          .filter((key) => key.startsWith('G'))
          .map((key) => (
            <DeviceCard
              key={key}
              label={groups[key].name}
              type={groups[key].type}
              value={groups[key].state}
              editable={true}
              onClick={async (e) => {
                if (e.target.tagName === 'DIV') {
                  await setGroupState(key, !groups[key].state)
                }
              }}
              onClickGear={() => {
                openModal(key)
              }}
            />
          ))}

        <GroupModal
          groupKey={groupKey}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      </div>
    </>
  )
}

export default Groups
