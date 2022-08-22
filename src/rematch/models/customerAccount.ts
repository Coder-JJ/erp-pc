import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import axios, { CancelTokenSource } from 'axios'
import { NodePage, nodeRequest } from '../../libs/request'

export interface CustomerAccountItem {
  billMonth: string
  billAmount: number
  paidAmount: number
  refundAmount: number
}

export interface FullCustomerAccount extends CustomerAccountItem {
  customerId: number
}

export interface CustomerAccount {
  id: number
  name: string
  customerAccounts: CustomerAccountItem[]
}

export interface FlatCustomerAccount extends CustomerAccountItem {
  id: number
  name: string
  key: string
  rowSpan: number
}

export interface Filter {
  customerName: string | undefined
  startMonth: string | null
  endMonth: string | null
  current: number
  size: number
}

export interface FindOneParams {
  customerId: number
  billMonth: string
}

export interface State {
  didMount: boolean
  shouldUpdate: boolean
  filter: Filter
  rows: FlatCustomerAccount[]
  count: number | null
  current: number
  size: number
}

let cancelTokenSource: CancelTokenSource | undefined

const state: State = {
  didMount: false,
  shouldUpdate: false,
  filter: {
    customerName: undefined,
    startMonth: null,
    endMonth: null,
    current: 1,
    size: 10
  },
  rows: [],
  count: null,
  current: 1,
  size: 10
}

export const customerAccount = createModel<RootModel>()({
  state,
  reducers: {
    shouldUpdate(state: State): State {
      state.shouldUpdate = true
      return state
    },
    updateState(state: State, keyValues: Partial<State>): State {
      return { ...state, ...keyValues }
    },
    updateFilter(state: State, keyValues: Partial<Filter>): State {
      state.filter = { ...state.filter, ...keyValues }
      return state
    }
  },
  effects: dispatch => ({
    async loadCustomerAccounts(_: any, store) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      const { filter, current, size } = store.customerAccount
      cancelTokenSource = axios.CancelToken.source()
      const { rows, count } = await nodeRequest.get<NodePage<CustomerAccount>, NodePage<CustomerAccount>>('/customer-account/page', {
        params: {
          ...filter,
          current,
          size
        },
        cancelToken: cancelTokenSource.token
      })
      cancelTokenSource = undefined
      dispatch.customerAccount.updateState({
        rows: rows.flatMap(r => r.customerAccounts.map<FlatCustomerAccount>((a, i) => ({ id: r.id, name: r.name, ...a, key: `${r.id}-${a.billMonth}`, rowSpan: i === 0 ? r.customerAccounts.length : 0 }))),
        count
      })
      dispatch.customerAccount.updateFilter({ current, size })
    },
    loadCustomerAccount(params: FindOneParams) {
      return nodeRequest.post<FullCustomerAccount | null, FullCustomerAccount | null>('/customer-account/one', params)
    }
  })
})
