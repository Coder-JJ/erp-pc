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
  reticule: number
  shoeCover: number
  container: number
}

export interface Goods extends Omit<GoodsProps, 'price'>, GoodsForm {
  id: number
  cancelId: number
}

export interface ReturnGoods {
  id: number
  cancelTime: number
  customId: number
  customName: string
  cancelPersonId: number
  cancelPersonName: string
  cancelGoodsRecordList: Goods[]
  remark: string | null
}

export interface AddForm extends Omit<ReturnGoods, 'id' | 'customId' | 'customName' | 'cancelPersonId' | 'cancelPersonName' | 'cancelGoodsRecordList'> {
  customId: number | undefined
  cancelPersonId: number | undefined
  cancelGoodsRecordList: GoodsForm[]
}

export interface EditForm extends Omit<ReturnGoods, 'customName' | 'cancelPersonName' | 'cancelGoodsRecordList'> {
  cancelGoodsRecordList: GoodsForm[]
}

export interface Filter {
  customIds: number[]
  cancelPersonIds: number[]
  goodsIds: number[]
  startTime: null
  endTime: null
  pageNum: number
  pageSize: number
}

export interface State {
  filter: Filter
  data: ReturnGoods[]
  total: number | null
  pageNum: number
  pageSize: number
  addForm: AddForm
  editForm: EditForm | undefined
}

let cancelTokenSource: CancelTokenSource | undefined

export const getInitialGoods = (): GoodsForm => ({
  goodsId: undefined,
  num: 0,
  price: 0,
  reticule: 0,
  shoeCover: 0,
  container: 0
})

const getInitialAddForm = (): AddForm => ({
  cancelTime: dayjs().valueOf(),
  customId: undefined,
  cancelPersonId: undefined,
  cancelGoodsRecordList: Array(5).fill(0).map(() => getInitialGoods()),
  remark: null
})

const state: State = {
  filter: {
    customIds: [],
    cancelPersonIds: [],
    goodsIds: [],
    startTime: null,
    endTime: null,
    pageNum: 1,
    pageSize: 10
  },
  data: [],
  total: null,
  pageNum: 1,
  pageSize: 10,
  addForm: getInitialAddForm(),
  editForm: undefined
}

export const returnGoods = createModel<RootModel>()({
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
      state.addForm.cancelGoodsRecordList[index][key] = value
      return state
    },
    addAddFormGoods(state: State): State {
      for (let i = 0; i < 5; i++) {
        state.addForm.cancelGoodsRecordList.push(getInitialGoods())
      }
      return state
    },
    resetAddFormGoodsProps(state: State, index: number): State {
      const goods = state.addForm.cancelGoodsRecordList[index]
      goods.goodsId = undefined
      goods.num = 0
      goods.price = 0
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
      state.editForm = { ...form }
      state.editForm.cancelGoodsRecordList = [...state.editForm.cancelGoodsRecordList, ...Array(5).fill(0).map(() => getInitialGoods())]
      state.editForm.cancelGoodsRecordList = state.editForm.cancelGoodsRecordList.slice(0, 5)
      return state
    },
    updateEditForm(state: State, keyValues: Partial<EditForm>): State {
      state.editForm = { ...(state.editForm || {}), ...keyValues } as any
      return state
    },
    updateEditFormGoods(state: State, { index, key, value }: { index: number, key: keyof GoodsForm, value: any }): State {
      if (state.editForm?.cancelGoodsRecordList) {
        state.editForm.cancelGoodsRecordList[index][key] = value
      }
      return state
    },
    addEditFormGoods(state: State): State {
      for (let i = 0; i < 5; i++) {
        state.editForm?.cancelGoodsRecordList.push(getInitialGoods())
      }
      return state
    },
    resetEditFormGoodsProps(state: State, index: number) {
      const goods = state.editForm?.cancelGoodsRecordList[index]
      if (goods) {
        goods.goodsId = undefined
        goods.num = 0
        goods.price = 0
        goods.reticule = 0
        goods.shoeCover = 0
        goods.container = 0
      }
      return state
    },
    clearEditForm(state: State) {
      state.editForm = undefined
      return state
    }
  },
  effects: dispatch => ({
    async loadReturnGoods(_: any, store) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      const { customIds, cancelPersonIds, goodsIds, startTime, endTime, ...filter } = store.returnGoods.filter
      cancelTokenSource = axios.CancelToken.source()
      const result = await request.get<Page<ReturnGoods>, Page<ReturnGoods>>('/cancel/page', {
        params: {
          customIds: customIds.join(','),
          cancelPersonIds: cancelPersonIds.join(','),
          goodsIds: goodsIds.join(','),
          startTime,
          endTime,
          pageNum: store.returnGoods.pageNum,
          pageSize: store.returnGoods.pageSize
        },
        cancelToken: cancelTokenSource.token
      })
      cancelTokenSource = undefined
      dispatch.returnGoods.updateState(result || {})
      dispatch.returnGoods.updateFilter({ pageNum: filter.pageNum, pageSize: filter.pageSize })
    },
    async addReturnGoods(returnGoods: AddForm) {
      await request.post('/cancel', returnGoods)
      dispatch.returnGoods.loadReturnGoods()
      dispatch.checkIn.shouldUpdate()
      dispatch.bill.shouldUpdate()
    },
    async editReturnGoods(returnGoods: EditForm) {
      await request.put('/cancel', returnGoods)
      dispatch.returnGoods.loadReturnGoods()
      dispatch.checkIn.shouldUpdate()
      dispatch.bill.shouldUpdate()
    },
    async deleteReturnGoods(returnGoods: ReturnGoods) {
      await request.delete(`/cancel/${returnGoods.id}`)
      dispatch.returnGoods.loadReturnGoods()
      dispatch.checkIn.shouldUpdate()
      dispatch.bill.shouldUpdate()
    }
  })
})
