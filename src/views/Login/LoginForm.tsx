import styles from './index.less'
import React from 'react'
import { useSelector } from 'react-redux'
import { Form, Input, Button } from 'antd'
import { FormProps } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { RootState } from '../../rematch'
import { LoginForm as LoginFormType } from '../../rematch/models/app'

export type Props = FormProps<LoginFormType>

const LoginForm: React.FC<Props> = function (props) {
  const { onFinish } = props
  const loading = useSelector((store: RootState) => store.loading.effects.app.login)

  return (
    <Form<LoginFormType> className={styles.form} name='login-form' onFinish={onFinish} size='large'>
      <Form.Item name='userName' rules={[{ required: true, message: '请输入用户名!' }]}>
        <Input prefix={<UserOutlined className={styles.icon} />} placeholder='用户名' />
      </Form.Item>
      <Form.Item name='password' rules={[{ required: true, message: '请输入密码!' }]}>
        <Input prefix={<LockOutlined className={styles.icon} />} type='password' placeholder='密码' />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={loading} block>登录</Button>
      </Form.Item>
    </Form>
  )
}

export default React.memo(LoginForm)
