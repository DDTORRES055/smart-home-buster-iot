import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import ImageLight from '../assets/img/login-office.jpeg'
import ImageDark from '../assets/img/login-office-dark.jpeg'
import { Label, Input, Button } from '@windmill/react-ui'

function Login() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [redirect, setRedirect] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (user) {
      setRedirect(true)
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch (error) {
      setLoginError('Credenciales invalidas')
      setTimeout(() => {
        setLoginError('')
      }, 3000)
    }
  }

  return (
    <div className='flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900'>
      {redirect && <Redirect to='/app' />}
      <div className='flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800'>
        <div className='flex flex-col overflow-y-auto md:flex-row'>
          <div className='h-32 md:h-auto md:w-1/2'>
            <img
              aria-hidden='true'
              className='object-cover w-full h-full dark:hidden'
              src={ImageLight}
              alt='Office'
            />
            <img
              aria-hidden='true'
              className='hidden object-cover w-full h-full dark:block'
              src={ImageDark}
              alt='Office'
            />
          </div>
          <main className='flex flex-col items-center justify-between p-6 sm:p-12 md:w-1/2'>
            <div></div>
            <form onSubmit={handleSubmit} className='w-full'>
              <h1 className='mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200'>
                Iniciar sesión
              </h1>
              <Label>
                <span>Email</span>
                <Input
                  className='mt-1'
                  type='email'
                  placeholder='ejemplo@dominio.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Label>

              <Label className='mt-4'>
                <span>Contraseña</span>
                <Input
                  className='mt-1'
                  type='password'
                  placeholder='***************'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Label>

              <input
                type='submit'
                value='Entrar'
                className=' align-bottom inline-flex items-center justify-center cursor-pointer leading-5 transition-colors duration-150 font-medium focus:outline-none px-4 py-2 rounded-lg text-sm text-white bg-purple-600 border border-transparent active:bg-purple-600 hover:bg-purple-700 focus:shadow-outline-purple w-full mt-4'
              />

              <div className='mt-4 text-red-600 text-sm text-center'>
                {loginError}
              </div>
            </form>
            <div className='text-center text-sm text-gray-400 italic font-light w-full'>
              <hr className='mb-2' />
              <p>
                Creado por: <br />
                <a
                  href='https://github.com/DDTORRES055'
                  className=' hover:text-purple-400'
                  target='_blank'
                >
                  Díaz Torres Daniel
                </a>{' '}
                <br />
                <a
                  href='https://github.com/ieschua'
                  className=' hover:text-purple-400'
                  target='_blank'
                >
                  Martínez García Ieschua Sebástian
                </a>{' '}
                <br />
                <a
                  href='https://github.com/tufiño'
                  className=' hover:text-purple-400'
                  target='_blank'
                >
                  Tufiño Hernández Gabriel
                </a>{' '}
                <br />
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Login
