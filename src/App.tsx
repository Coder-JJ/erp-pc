import { hot } from 'react-hot-loader/root'
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import views from './views'
import PrivateRoute from './PrivateRoute'
import Layout from './Layout'

const App: React.FC = function() {
  return (
    <Switch>
      <Route path='/login' exact strict sensitive>
        <views.Login />
      </Route>
      <PrivateRoute path='/print/bill' exact strict sensitive>
        <views.PrintBill />
      </PrivateRoute>
      <PrivateRoute path='/print/checkout' exact strict sensitive>
        <views.PrintCheckout />
      </PrivateRoute>
      <PrivateRoute path='*'>
        <Layout />
      </PrivateRoute>
    </Switch>
  )
}

export default hot(React.memo(App))
