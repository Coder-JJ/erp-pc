import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Modal } from 'antd'
import LoginForm from './LoginForm'
import { RootState, Dispatch } from '../../rematch'
import { LoginStatus } from '../../rematch/models/app'

const LoginModal: React.FC = function() {
  const loginStatus = useSelector((store: RootState) => store.app.loginStatus)
  const dispatch = useDispatch<Dispatch>()

  return (
    <Modal visible={loginStatus === LoginStatus.LoginTimeout} title='用户登录' footer={null} width={288} closable={false}>
      <LoginForm onFinish={dispatch.app.login} />
    </Modal>
  )
}

export default React.memo(LoginModal)
