import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import { message } from 'antd'
import { request } from '../../libs'

export enum LoginStatus {
  NotLogin,
  Login,
  LoginTimeout
}

export interface LoginForm {
  userName: string
  password: string
}

export interface State {
  loginStatus: LoginStatus
  menuCollapsed: boolean
}

export const app = createModel<RootModel>()({
  state: {
    loginStatus: LoginStatus.NotLogin,
    menuCollapsed: false
  } as State,
  reducers: {
    updateState(state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as never
      }
      return state
    },
    toggleMenuCollapsed(state: State): State {
      state.menuCollapsed = !state.menuCollapsed
      return state
    }
  },
  effects: dispatch => ({
    async login(params: LoginForm) {
      await request.post('/user/login', {}, { params })
      dispatch.app.updateState({ loginStatus: LoginStatus.Login })
      message.success('登录成功.')
    },
    async logout() {
      await request.post('/user/logout')
      dispatch.app.updateState({ loginStatus: LoginStatus.NotLogin })
    }
  })
})
