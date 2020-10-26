import axios, { CancelTokenSource } from 'axios'
import { request } from '../../libs'
import { Dispatch, RootState } from '../../rematch'

export interface Goods {
  id: number
  name: string
  brand: string
  texture: string
  size: string
  remark: string
}

export type GoodsProps = Omit<Goods, 'id' | 'remark'>

export type AddForm = Omit<Goods, 'id'>

export interface State {
  keyword: string
  data: Goods[]
  addForm: AddForm
  editForm: Goods
}

let cancelTokenSource: CancelTokenSource | undefined

const getInitialAddForm = (): AddForm => ({
  name: '',
  brand: '',
  texture: '',
  size: '',
  remark: ''
})

const getInitialEditForm = (): Goods => ({
  id: NaN,
  ...getInitialAddForm()
})

const state: State = {
  keyword: '',
  data: [],
  addForm: getInitialAddForm(),
  editForm: getInitialEditForm()
}

export const goods = {
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
    updateEditForm (state: State, keyValues: Partial<Goods>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.editForm[key as keyof Goods] = value as never
      }
      return state
    },
    clearEditForm (state: State) {
      state.editForm = getInitialEditForm()
      return state
    }
  },
  effects: (dispatch: Dispatch) => ({
    async loadGoods (_: any, store: RootState) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      cancelTokenSource = axios.CancelToken.source()
      const data = await request.get<Goods[], Goods[]>('/goods/list', { cancelToken: cancelTokenSource.token })
      cancelTokenSource = undefined
      dispatch.goods.updateState({ data })
    },
    async addGoods (goods: AddForm): Promise<number> {
      const id = await request.post<number, number>('/goods/insert', goods)
      dispatch.goods.loadGoods()
      return id
    },
    async editGoods (goods: Goods) {
      await request.put('/goods/update', goods)
      dispatch.goods.loadGoods()
    },
    async deleteGoods (id: number) {
      await request.delete(`/goods/delete/${id}`)
      dispatch.goods.loadGoods()
    }
  })
}
