import styles from './index.less'
import React, { useCallback } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import * as H from 'history'
import LoginForm from './LoginForm'
import { Dispatch } from '../../rematch'
import { LoginForm as LoginFormType } from '../../rematch/models/app'

const Login: React.FC = function () {
  const history = useHistory()
  const { state } = useLocation<H.Location<H.LocationState>>()
  const dispatch = useDispatch<Dispatch>()
  const onLogin = useCallback(async (form: LoginFormType) => {
    await dispatch.app.login(form)
    history.replace(state || '/checkout')
  }, [dispatch.app, state, history])

  return (
    <div className={styles.wrap}>
      <LoginForm onFinish={onLogin} />
    </div>
  )
}

export default React.memo(Login)
