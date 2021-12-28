import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { notification } from 'antd'
import store from '../rematch'
import { LoginStatus } from '../rematch/models/app'

export interface Response<T = any> {
  status: boolean
  statusCode: '200' | '401' | string
  statusMessage?: string
  result: T
}

export interface Page<T> {
  data: T[]
  pageNum: number
  pageSize: number
  total: number
}

export function createInstance(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL
  })

  instance.interceptors.request.use(
    config => config,
    e => Promise.reject(e)
  )

  instance.interceptors.response.use(
    (response: AxiosResponse<Response>) => {
      if (response.status === 200) {
        const { status, statusCode, statusMessage, result } = response.data
        if (status) {
          return result
        } else if (statusCode === '401') {
          store.dispatch.app.updateState({ loginStatus: LoginStatus.LoginTimeout })
        }
        notification.error({ message: '错误', description: statusMessage || statusCode })
        return Promise.reject(statusMessage || statusCode)
      }
      notification.error({ message: '错误', description: response.statusText })
      return Promise.reject(response.statusText)
    },
    e => {
      if (!axios.isCancel(e)) {
        notification.error({ message: '错误', description: e?.message || e })
      }
      return Promise.reject(e)
    }
  )

  return instance
}

export default createInstance('/java-api')

export const nodeRequest = createInstance('/node-api')
