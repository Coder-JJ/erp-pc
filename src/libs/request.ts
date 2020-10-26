import axios, { AxiosResponse } from 'axios'
import { notification } from 'antd'

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

const urlPrefix = '/f-api'

const instance = axios.create()

instance.interceptors.request.use(
  config => {
    let url = config.url
    if (url) {
      if (!url.startsWith('/') && !/^http(s)?:\/\//.test(url)) {
        url = `/${url}`
      }
      if (url.startsWith('/') && !url.startsWith(urlPrefix)) {
        url = `${urlPrefix}${url}`
      }
    }
    return { ...config, url }
  },
  e => Promise.reject(e)
)

instance.interceptors.response.use(
  (response: AxiosResponse<Response>) => {
    if (response.status === 200) {
      const { status, statusCode, statusMessage, result } = response.data
      if (status) {
        return result
      } else if (statusCode === '401') {
        // 登录过期
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

export default instance
