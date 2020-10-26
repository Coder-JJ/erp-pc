import axios, { CancelTokenSource } from 'axios'
import { request } from '../../libs'
import { Dispatch, RootState } from '../../rematch'

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
  keyword: '',
  data: [],
  addForm: getInitialAddForm(),
  editForm: getInitialEditForm()
}

export const supplier = {
  state,
  reducers: {
    updateState (state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as any
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
  effects: (dispatch: Dispatch) => ({
    async loadSuppliers (_: any, store: RootState) {
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
      dispatch.supplier.loadSuppliers()
      return id
    },
    async editSupplier (supplier: Supplier) {
      await request.put('/supplier/update', supplier)
      dispatch.supplier.loadSuppliers()
    },
    async deleteSupplier (id: number) {
      await request.delete(`/supplier/delete/${id}`)
      dispatch.supplier.loadSuppliers()
    }
  })
}
