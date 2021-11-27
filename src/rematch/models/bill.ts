import { createModel } from '@rematch/core'
import { message } from 'antd'
import dayjs from 'dayjs'
import axios, { CancelTokenSource } from 'axios'
import { request } from '../../libs'
import type { RootModel } from '.'
import { CheckOut } from './checkOut'

export interface Filter {
  customIds: number[]
  receiverIds: number[]
  goodsIds: number[]
  startTime: string
  endTime: string
}

export enum SearchMode {
  All,
  Normal
}

export interface State {
  shouldUpdate: boolean
  displayFilter: Filter
  searchMode: SearchMode
  exceptCustomers: number[]
  data: CheckOut[]
  filter: Filter | undefined
}

export const loadBill = (params: Filter, cancelTokenSource?: CancelTokenSource): Promise<CheckOut[]> => {
  return request.post<CheckOut[], CheckOut[]>('/repertory/fetchRecord/all/list', params, { cancelToken: cancelTokenSource?.token })
}

let cancelTokenSource: CancelTokenSource | undefined

const getInitialState = (): State => {
  return {
    shouldUpdate: false,
    displayFilter: {
      customIds: [],
      receiverIds: [],
      goodsIds: [],
      startTime: dayjs().startOf('M').startOf('d').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs().endOf('M').endOf('d').format('YYYY-MM-DD HH:mm:ss')
    },
    searchMode: SearchMode.Normal,
    exceptCustomers: [],
    data: [],
    filter: undefined
  }
}

export const bill = createModel<RootModel>()({
  state: getInitialState(),
  reducers: {
    shouldUpdate (state: State): State {
      state.shouldUpdate = true
      return state
    },
    updateState (state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as never
      }
      return state
    },
    resetState (): State {
      return getInitialState()
    },
    updateFilter (state: State, keyValues: Partial<Filter>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.displayFilter[key as keyof Filter] = value as never
      }
      return state
    }
  },
  effects: dispatch => ({
    async loadBill (_: any, store): Promise<CheckOut[]> {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      const allCustomers = store.customer.data
      const { displayFilter: { customIds, ...restFilter }, searchMode, exceptCustomers } = store.bill
      if (searchMode === SearchMode.All && !allCustomers.length) {
        return message.error('当前没有客户数据')
      }
      const filter: Filter = {
        ...restFilter,
        customIds: searchMode === SearchMode.All ? allCustomers.filter(({ id }) => !exceptCustomers.some(c => c === id)).map(({ id }) => id) : customIds
      }
      cancelTokenSource = axios.CancelToken.source()
      const data = await loadBill(filter, cancelTokenSource)
      cancelTokenSource = undefined
      dispatch.bill.updateState({ data, filter })
      return data
    },
    async updateBill (_: any, store) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      if (!store.bill.filter) {
        dispatch.bill.updateState({ shouldUpdate: false })
        return
      }
      cancelTokenSource = axios.CancelToken.source()
      const data = await loadBill(store.bill.filter, cancelTokenSource)
      cancelTokenSource = undefined
      dispatch.bill.updateState({ data, shouldUpdate: false })
    }
  })
})
