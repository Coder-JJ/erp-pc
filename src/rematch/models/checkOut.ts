import axios, { CancelTokenSource } from 'axios'
import dayjs from 'dayjs'
import { request } from '../../libs'
import { Page } from '../../libs/request'
import { Dispatch, RootState } from '../../rematch'
import { GoodsProps } from './goods'

export interface GoodsForm {
  goodsId: number | undefined
  num: number
  price: number
  discount: number
  paid: number | null
}

export interface Goods extends Omit<GoodsProps, 'price'>, GoodsForm {
  id: number
  remark: string
}

export enum CheckOutState {
  InStock = 1,
  Delivered = 2,
  Signed = 3
}

export interface CheckOut {
  id: number
  odd: string
  dealTime: number
  warehouseId: number
  warehouseName: string
  customId: number | undefined | null
  customName: string
  receiverId: number | undefined | null
  receiverName: string
  receiver: string
  receiverPhone: string
  receivedAddress: string
  receivedTime: number | null
  fetchGoodsRecordList: Goods[]
  discount: number
  otherCost: number | null
  otherCostName: string
  paid: number | null
  signer: string
  remark: string
  state: CheckOutState
  createTime: number
}

export interface AddForm extends Omit<CheckOut, 'id' | 'warehouseId' | 'warehouseName' | 'customName' | 'receiverName' | 'fetchGoodsRecordList' | 'state' | 'createTime'> {
  warehouseId: number | undefined
  fetchGoodsRecordList: GoodsForm[]
}

export interface EditForm extends Omit<CheckOut, 'warehouseName' | 'customName' | 'receiverName' | 'fetchGoodsRecordList' | 'state'> {
  fetchGoodsRecordList: GoodsForm[]
}

export interface Filter {
  odd: string
  warehouseId: number | undefined
  customId: number | undefined
  pageNum: number
  pageSize: number
}

export interface State {
  filter: Filter
  data: CheckOut[]
  total: number | null
  pageNum: number
  pageSize: number
  addForm: AddForm
  editForm: EditForm
}

let cancelTokenSource: CancelTokenSource | undefined

const getInitialGoods = (): GoodsForm => ({
  goodsId: undefined,
  num: 0,
  price: 0,
  discount: 1,
  paid: null
})

const getInitialAddForm = (): AddForm => ({
  odd: '',
  dealTime: dayjs().valueOf(),
  warehouseId: undefined,
  customId: undefined,
  receiverId: undefined,
  receiver: '',
  receiverPhone: '',
  receivedAddress: '',
  receivedTime: dayjs().valueOf(),
  fetchGoodsRecordList: [],
  discount: 1,
  paid: null,
  otherCost: null,
  otherCostName: '',
  signer: '',
  remark: ''
})

const getInitialEditForm = (): EditForm => ({
  id: NaN,
  ...getInitialAddForm(),
  warehouseId: NaN,
  fetchGoodsRecordList: [],
  createTime: dayjs().valueOf()
})

const state: State = {
  filter: {
    odd: '',
    warehouseId: undefined,
    customId: undefined,
    pageNum: 1,
    pageSize: 10
  },
  data: [],
  total: null,
  pageNum: 1,
  pageSize: 10,
  addForm: getInitialAddForm(),
  editForm: getInitialEditForm()
}

export const checkOut = {
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
    },
    updateAddForm (state: State, keyValues: Partial<AddForm>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.addForm[key as keyof AddForm] = value as never
      }
      return state
    },
    updateAddFormGoods (state: State, { index, key, value }: { index: number, key: keyof GoodsForm, value: any }): State {
      state.addForm.fetchGoodsRecordList[index][key] = value
      return state
    },
    addAddFormGoods (state: State): State {
      for (let i = 0; i < 5; i++) {
        state.addForm.fetchGoodsRecordList.push(getInitialGoods())
      }
      return state
    },
    deleteAddFormGoods (state: State, index: number): State {
      state.addForm.fetchGoodsRecordList.splice(index, 1)
      return state
    },
    clearAddForm (state: State): State {
      state.addForm = getInitialAddForm()
      return state
    },
    updateEditForm (state: State, keyValues: Partial<EditForm>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.editForm[key as keyof EditForm] = value as never
      }
      return state
    },
    updateEditFormGoods (state: State, { index, key, value }: { index: number, key: keyof GoodsForm, value: any }): State {
      state.editForm.fetchGoodsRecordList[index][key] = value
      return state
    },
    addEditFormGoods (state: State): State {
      for (let i = 0; i < 5; i++) {
        state.editForm.fetchGoodsRecordList.push(getInitialGoods())
      }
      return state
    },
    deleteEditFormGoods (state: State, index: number) {
      state.editForm.fetchGoodsRecordList.splice(index, 1)
      return state
    },
    clearEditForm (state: State) {
      state.editForm = getInitialEditForm()
      return state
    }
  },
  effects: (dispatch: Dispatch) => ({
    async loadCheckOuts (_: any, store: RootState) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      const filter: Filter = {
        ...store.checkOut.filter,
        odd: store.checkOut.filter.odd.trim()
      }
      cancelTokenSource = axios.CancelToken.source()
      const result = await request.get<Page<CheckOut>, Page<CheckOut>>('/repertory/fetchRecord/list', { params: filter, cancelToken: cancelTokenSource.token })
      cancelTokenSource = undefined
      dispatch.checkOut.updateState(result || {})
    },
    async addCheckOut (checkOut: AddForm) {
      await request.post('/repertory/fetchRecord/insert', checkOut)
      dispatch.checkOut.loadCheckOuts()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(checkOut.warehouseId!)
    },
    async editCheckOut (checkOut: EditForm) {
      await request.put('/repertory/fetchRecord/update', checkOut)
      dispatch.checkOut.loadCheckOuts()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(checkOut.warehouseId)
    },
    async deleteCheckOut (id: number, store: RootState) {
      const repositoryId = store.checkOut.data.find(item => item.id === id)!.warehouseId
      await request.delete(`/repertory/fetchRecord/delete/${id}`)
      dispatch.checkOut.loadCheckOuts()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(repositoryId)
    }
  })
}
