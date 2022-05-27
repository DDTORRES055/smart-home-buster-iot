import React, { useContext, Suspense, useEffect, lazy, useState } from 'react'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import routes from '../routes'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Main from '../containers/Main'
import ThemedSuspense from '../components/ThemedSuspense'
import { SidebarContext } from '../context/SidebarContext'

const Page404 = lazy(() => import('../pages/404'))

function Layout() {
  const { user } = useAuth()
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext)
  const [ redirect, setRedirect ] = useState(false)
  let location = useLocation()

  useEffect(() => {
    closeSidebar()
  }, [location])

  useEffect(() => {
    if (!user) {
      setRedirect(true)
    }
  }, [user])

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSidebarOpen && 'overflow-hidden'}`}
    >
      {redirect && <Redirect to='/login' />}
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <Header />
        <Main>
          <Suspense fallback={<ThemedSuspense />}>
            <Switch>
              {routes.map((route, i) => {
                return route.component ? (
                  <Route
                    key={i}
                    exact={true}
                    path={`/app${route.path}`}
                    render={(props) => <route.component {...props} />}
                  />
                ) : null
              })}
              <Redirect exact from="/app" to="/app/dashboard" />
              <Route component={Page404} />
            </Switch>
          </Suspense>
        </Main>
      </div>
    </div>
  )
}

export default Layout
