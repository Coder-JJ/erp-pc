import { createModel } from '@rematch/core'
import { message } from 'antd'
import dayjs from 'dayjs'
import axios, { CancelTokenSource } from 'axios'
import { request } from '../../libs'
import type { RootModel } from '.'
import { CheckOut } from './checkOut'
import { ReturnGoods } from './returnGoods'

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
  checkOuts: CheckOut[]
  returnGoods: ReturnGoods[]
  filter: Filter | undefined
}

export const loadCheckOuts = (filter: Filter, cancelTokenSource?: CancelTokenSource): Promise<CheckOut[]> => {
  return request.post<CheckOut[], CheckOut[]>('/repertory/fetchRecord/all/list', filter, { cancelToken: cancelTokenSource?.token })
}

export const loadReturnGoods = (filter: Filter, cancelTokenSource?: CancelTokenSource): Promise<ReturnGoods[]> => {
  return request.post<ReturnGoods[], ReturnGoods[]>('/cancel/all/list', {
    customIds: filter.customIds,
    cancelPersonIds: filter.receiverIds,
    goodsIds: filter.goodsIds,
    startTime: filter.startTime,
    endTime: filter.endTime
  }, {
    cancelToken: cancelTokenSource?.token
  })
}

let cancelTokenSource: CancelTokenSource | undefined

const getInitialState = (): State => {
  return {
    shouldUpdate: false,
    displayFilter: {
      customIds: [],
      receiverIds: [],
      goodsIds: [],
      startTime: dayjs().subtract(1, 'M').startOf('M').startOf('d').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs().subtract(1, 'M').endOf('M').endOf('d').format('YYYY-MM-DD HH:mm:ss')
    },
    searchMode: SearchMode.Normal,
    exceptCustomers: [],
    checkOuts: [],
    returnGoods: [],
    filter: undefined
  }
}

export const bill = createModel<RootModel>()({
  state: getInitialState(),
  reducers: {
    shouldUpdate(state: State): State {
      state.shouldUpdate = true
      return state
    },
    updateState(state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as never
      }
      return state
    },
    resetState(): State {
      return getInitialState()
    },
    updateFilter(state: State, keyValues: Partial<Filter>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.displayFilter[key as keyof Filter] = value as never
      }
      return state
    }
  },
  effects: dispatch => ({
    async loadBill(_: any, store): Promise<CheckOut[]> {
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
      const [checkOuts, returnGoods] = await Promise.all([
        loadCheckOuts(filter, cancelTokenSource),
        loadReturnGoods(filter, cancelTokenSource)
      ])
      cancelTokenSource = undefined
      dispatch.bill.updateState({ checkOuts, returnGoods, filter })
      return checkOuts
    },
    async updateBill(_: any, store) {
      const filter = store.bill.filter
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      if (!filter) {
        dispatch.bill.updateState({ shouldUpdate: false })
        return
      }
      cancelTokenSource = axios.CancelToken.source()
      const [checkOuts, returnGoods] = await Promise.all([
        loadCheckOuts(filter, cancelTokenSource),
        loadReturnGoods(filter, cancelTokenSource)
      ])
      cancelTokenSource = undefined
      dispatch.bill.updateState({ checkOuts, returnGoods, shouldUpdate: false })
    }
  })
})
