import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import axios, { CancelTokenSource } from 'axios'
import dayjs from 'dayjs'
import { request } from '../../libs'
import { Page } from '../../libs/request'
import { GoodsProps } from './goods'

export interface GoodsForm {
  goodsId: number | undefined
  num: number
  price: number
  discount: number
  paid: number | null
  reticule: number
  shoeCover: number
  container: number
}

export interface Goods extends Omit<GoodsProps, 'price'>, GoodsForm {
  id: number
  remark: string
}

export enum CheckOutState {
  InStock = 1,
  Delivered = 2,
  Signed = 3,
  Paid = 4,
  Canceled = 99
}

export const checkOutStateNameMap = {
  1: '备货中',
  2: '已发货',
  3: '已签收',
  4: '已收款',
  99: '作废'
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
  receiver: string | null
  receiverPhone: string | null
  receivedAddress: string | null
  receivedTime: number | null
  fetchGoodsRecordList: Goods[]
  discount: number
  otherCost: number | null
  otherCostName: string | null
  paid: number | null
  signer: string | null
  remark: string | null
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

export const loadCheckOut = (id: number | string, cancelTokenSource?: CancelTokenSource): Promise<CheckOut> => {
  return request.get<CheckOut, CheckOut>(`/repertory/fetchRecord/${id}`, { cancelToken: cancelTokenSource?.token })
}

let cancelTokenSource: CancelTokenSource | undefined

export const getInitialGoods = (): GoodsForm => ({
  goodsId: undefined,
  num: 0,
  price: 0,
  discount: 1,
  paid: null,
  reticule: 0,
  shoeCover: 0,
  container: 0
})

const getInitialAddForm = (): AddForm => ({
  odd: '',
  dealTime: dayjs().valueOf(),
  warehouseId: undefined,
  customId: undefined,
  receiverId: undefined,
  receiver: null,
  receiverPhone: null,
  receivedAddress: null,
  receivedTime: dayjs().valueOf(),
  fetchGoodsRecordList: [],
  discount: 1,
  paid: null,
  otherCost: null,
  otherCostName: null,
  signer: null,
  remark: null
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

export const checkOut = createModel<RootModel>()({
  state,
  reducers: {
    updateState(state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as any
      }
      return state
    },
    updateFilter(state: State, keyValues: Partial<Filter>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.filter[key as keyof Filter] = value as never
      }
      return state
    },
    updateAddForm(state: State, keyValues: Partial<AddForm>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.addForm[key as keyof AddForm] = value as never
      }
      return state
    },
    updateAddFormGoods(state: State, { index, key, value }: { index: number, key: keyof GoodsForm, value: any }): State {
      state.addForm.fetchGoodsRecordList[index][key] = value
      return state
    },
    addAddFormGoods(state: State): State {
      for (let i = 0; i < 5; i++) {
        state.addForm.fetchGoodsRecordList.push(getInitialGoods())
      }
      return state
    },
    resetAddFormGoodsProps(state: State, index: number): State {
      const goods = state.addForm.fetchGoodsRecordList[index]
      goods.goodsId = undefined
      goods.num = 0
      goods.price = 0
      goods.discount = 1
      goods.paid = null
      goods.reticule = 0
      goods.shoeCover = 0
      goods.container = 0
      return state
    },
    clearAddForm(state: State): State {
      state.addForm = getInitialAddForm()
      return state
    },
    setEditForm(state: State, form: EditForm): State {
      for (const [key, value] of Object.entries(form)) {
        state.editForm[key as keyof EditForm] = value as never
      }
      state.editForm.fetchGoodsRecordList = [...state.editForm.fetchGoodsRecordList, ...Array(5).fill(0).map(() => getInitialGoods())]
      state.editForm.fetchGoodsRecordList = state.editForm.fetchGoodsRecordList.slice(0, 5)
      return state
    },
    updateEditForm(state: State, keyValues: Partial<EditForm>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.editForm[key as keyof EditForm] = value as never
      }
      return state
    },
    updateEditFormGoods(state: State, { index, key, value }: { index: number, key: keyof GoodsForm, value: any }): State {
      state.editForm.fetchGoodsRecordList[index][key] = value
      return state
    },
    addEditFormGoods(state: State): State {
      for (let i = 0; i < 5; i++) {
        state.editForm.fetchGoodsRecordList.push(getInitialGoods())
      }
      return state
    },
    resetEditFormGoodsProps(state: State, index: number) {
      const goods = state.editForm.fetchGoodsRecordList[index]
      goods.goodsId = undefined
      goods.num = 0
      goods.price = 0
      goods.discount = 1
      goods.paid = null
      goods.reticule = 0
      goods.shoeCover = 0
      goods.container = 0
      return state
    },
    clearEditForm(state: State) {
      state.editForm = getInitialEditForm()
      return state
    }
  },
  effects: dispatch => ({
    async loadCheckOuts(_: any, store) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      const filter: Filter = {
        ...store.checkOut.filter,
        odd: store.checkOut.filter.odd.trim(),
        pageNum: store.checkOut.pageNum,
        pageSize: store.checkOut.pageSize
      }
      cancelTokenSource = axios.CancelToken.source()
      const result = await request.get<Page<CheckOut>, Page<CheckOut>>('/repertory/fetchRecord/list', { params: filter, cancelToken: cancelTokenSource.token })
      cancelTokenSource = undefined
      dispatch.checkOut.updateState(result || {})
      dispatch.checkOut.updateFilter({ pageNum: filter.pageNum, pageSize: filter.pageSize })
    },
    async addCheckOut(checkOut: AddForm) {
      await request.post('/repertory/fetchAndSaveRecord/insert', checkOut)
      dispatch.checkOut.loadCheckOuts()
      dispatch.checkIn.shouldUpdate()
      dispatch.bill.shouldUpdate()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(checkOut.warehouseId!)
    },
    async editCheckOut(checkOut: EditForm) {
      await request.put('/repertory/fetchAndSaveRecord/update', checkOut)
      dispatch.checkOut.loadCheckOuts()
      dispatch.checkIn.shouldUpdate()
      dispatch.bill.shouldUpdate()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(checkOut.warehouseId)
    },
    async setCheckOutState({ id, state }: { id: number, state: CheckOutState }) {
      await request.patch(`/repertory/fetchRecord/status/${id}?state=${state}`)
      dispatch.checkOut.loadCheckOuts()
      dispatch.bill.shouldUpdate()
    },
    async cancelCheckOut(checkOut: CheckOut) {
      await request.patch(`/repertory/fetchAndSaveRecord/cancel/${checkOut.id}`)
      dispatch.checkOut.loadCheckOuts()
      dispatch.checkIn.shouldUpdate()
      dispatch.bill.shouldUpdate()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(checkOut.warehouseId)
    },
    async deleteCheckOut(checkOut: CheckOut) {
      await request.delete(`/repertory/fetchAndSaveRecord/delete/${checkOut.id}`)
      dispatch.checkOut.loadCheckOuts()
      dispatch.checkIn.shouldUpdate()
      dispatch.bill.shouldUpdate()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(checkOut.warehouseId)
    }
  })
})
