import axios, { CancelTokenSource } from 'axios'
import { request } from '../../libs'
import { Dispatch, RootState } from '../../rematch'

export interface Customer {
  id: number
  name: string
  leader: string
  leaderPhone: string
  phone: string
  address: string
  addressDetail: string
  bank: string
  bankAccount: string
  bankAccountName: string
  mail: string
  fax: string
  remark: string
  sort: number
}

export type AddForm = Omit<Customer, 'id'>

export interface State {
  didMount: boolean
  shouldUpdate: boolean
  keyword: string
  data: Customer[]
  addForm: AddForm
  editForm: Customer
}

let cancelTokenSource: CancelTokenSource | undefined

const getInitialAddForm = (): AddForm => ({
  name: '',
  leader: '',
  leaderPhone: '',
  phone: '',
  address: '',
  addressDetail: '',
  bank: '',
  bankAccount: '',
  bankAccountName: '',
  mail: '',
  fax: '',
  remark: '',
  sort: 0
})

const getInitialEditForm = (): Customer => ({
  id: NaN,
  ...getInitialAddForm()
})

const state: State = {
  didMount: false,
  shouldUpdate: false,
  keyword: '',
  data: [],
  addForm: getInitialAddForm(),
  editForm: getInitialEditForm()
}

export const customer = {
  state,
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
    updateAddForm (state: State, keyValues: Partial<AddForm>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.addForm[key as keyof AddForm] = value as never
      }
      return state
    },
    clearAddForm (state: State): State {
      state.addForm = getInitialAddForm()
      return state
    },
    updateEditForm (state: State, keyValues: Partial<Customer>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.editForm[key as keyof Customer] = value as never
      }
      return state
    },
    clearEditForm (state: State) {
      state.editForm = getInitialEditForm()
      return state
    }
  },
  effects: (dispatch: Dispatch) => ({
    async loadCustomers (_: any, store: RootState) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      cancelTokenSource = axios.CancelToken.source()
      const data = await request.get<Customer[], Customer[]>('/custom/list', { cancelToken: cancelTokenSource.token })
      cancelTokenSource = undefined
      dispatch.customer.updateState(({ data }))
    },
    async addCustomer (customer: AddForm) {
      const id = await request.post<number, number>('/custom/insert', customer)
      dispatch.customer.shouldUpdate()
      return id
    },
    async editCustomer (customer: Customer) {
      await request.put('/custom/update', customer)
      dispatch.customer.shouldUpdate()
    },
    async deleteCustomer (id: number) {
      await request.delete(`/custom/delete/${id}`)
      dispatch.customer.shouldUpdate()
    }
  })
}
