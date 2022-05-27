import React, { lazy } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'
import AccessibleNavigationAnnouncer from './components/AccessibleNavigationAnnouncer'
import { AuthProvider } from './context/AuthContext'

const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))

function App() {
  return (
    <>
      <Router>
        <AccessibleNavigationAnnouncer />
        <Switch>
          <AuthProvider>
            <Route path='/login' component={Login} />

            {/* Place new routes over this */}
            <Route path='/app' component={Layout} />
            {/* If you have an index page, you can remothis Redirect */}
            <Redirect exact from='/' to='/login' />
          </AuthProvider>
        </Switch>
      </Router>
    </>
  )
}

export default App
