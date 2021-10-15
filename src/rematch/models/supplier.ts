import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import axios, { CancelTokenSource } from 'axios'
import { request } from '../../libs'

export interface Supplier {
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
  website: string
  remark: string
  sort: number
}

export type AddForm = Omit<Supplier, 'id'>

export interface State {
  didMount: boolean
  shouldUpdate: boolean
  keyword: string
  data: Supplier[]
  addForm: AddForm
  editForm: Supplier
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
  website: '',
  remark: '',
  sort: 0
})

const getInitialEditForm = (): Supplier => ({
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

export const supplier = createModel<RootModel>()({
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
    updateEditForm (state: State, keyValues: Partial<Supplier>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.editForm[key as keyof Supplier] = value as never
      }
      return state
    },
    clearEditForm (state: State) {
      state.editForm = getInitialEditForm()
      return state
    }
  },
  effects: dispatch => ({
    async loadSuppliers (_: any, store) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      cancelTokenSource = axios.CancelToken.source()
      const data = await request.get<Supplier[], Supplier[]>('/supplier/list', { cancelToken: cancelTokenSource.token })
      cancelTokenSource = undefined
      dispatch.supplier.updateState(({ data }))
    },
    async addSupplier (supplier: AddForm) {
      const id = await request.post<number, number>('/supplier/insert', supplier)
      dispatch.supplier.shouldUpdate()
      return id
    },
    async editSupplier (supplier: Supplier) {
      await request.put('/supplier/update', supplier)
      dispatch.supplier.shouldUpdate()
    },
    async deleteSupplier (id: number) {
      await request.delete(`/supplier/delete/${id}`)
      dispatch.supplier.shouldUpdate()
    }
  })
})
