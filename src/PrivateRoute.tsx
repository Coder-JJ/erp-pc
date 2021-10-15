import React from 'react'
import { Route, RouteProps, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './rematch'
import { LoginStatus } from './rematch/models/app'

const PrivateRoute: React.FC<RouteProps> = function ({ children, component, ...props }) {
  const { loginStatus } = useSelector((store: RootState) => store.app)

  return (
    <Route
      {...props}
      render={({ location }) => (
        loginStatus === LoginStatus.NotLogin ? <Redirect to={{ pathname: '/login', state: location }} /> : (children || component)
      )}
    />
  )
}

export default React.memo(PrivateRoute)
