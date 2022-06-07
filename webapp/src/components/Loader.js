import React from 'react'

import MyComponent from 'react-fullpage-custom-loader'

import { loaderOptions, getRandomLoader } from '../utils/data/loaderData'

export default function Loader({ visible }) {
  return (
    <>
      {visible && (
        <MyComponent {...loaderOptions} loaderType={getRandomLoader()} />
      )}
    </>
  )
}
