import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import qs from 'qs'
import axios, { CancelTokenSource } from 'axios'
import { request } from '../../libs'
import { CheckOut } from './checkOut'

export interface Filter {
  customIds: number[]
  receiverIds: number[]
  goodsIds: number[]
  startTime: string | null
  endTime: string | null
}

export interface PrintRouteParams {
  customIds?: string
  receiverIds?: string
  goodsIds?: string
  startTime: string
  endTime: string
}

export interface State {
  filter: Filter
  data: CheckOut[]
  params: string
}

export const loadBill = (params: string, cancelTokenSource?: CancelTokenSource): Promise<CheckOut[]> => {
  return request.get<CheckOut[], CheckOut[]>(`/repertory/fetchRecord/all/list?${params}`, { cancelToken: cancelTokenSource?.token })
}

let cancelTokenSource: CancelTokenSource | undefined

const state: State = {
  // filter: {
  //   customIds: [],
  //   receiverIds: [],
  //   goodsIds: [],
  //   startTime: null,
  //   endTime: null
  // },
  filter: {
    customIds: [],
    receiverIds: [134],
    goodsIds: [],
    startTime: '2020-10-01',
    endTime: '2021-10-01'
  },
  data: [],
  params: ''
}

export const bill = createModel<RootModel>()({
  state,
  reducers: {
    updateState (state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as any
      }
      return state
    },
    updateFilter (state: State, keyValues: Partial<Filter>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.filter[key as keyof Filter] = value as never
      }
      return state
    }
  },
  effects: dispatch => ({
    async loadBill (_: any, store) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      const params = qs.stringify(store.bill.filter, { arrayFormat: 'comma' })
      cancelTokenSource = axios.CancelToken.source()
      const data = await loadBill(params, cancelTokenSource)
      cancelTokenSource = undefined
      dispatch.bill.updateState({ data, params })
    }
  })
})
