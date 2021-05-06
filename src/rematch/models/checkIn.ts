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

export interface CheckIn {
  id: number
  odd: string
  warehouseId: number
  supplierId: number | undefined | null
  signer: string
  receivedTime: number
  discount: number
  paid: number | null
  saveGoodsRecordList: Goods[]
  remark: string
  createTime: number
}

export interface AddForm extends Omit<CheckIn, 'id' | 'warehouseId' | 'saveGoodsRecordList' | 'createTime'> {
  warehouseId: number | undefined
  saveGoodsRecordList: GoodsForm[]
}

export interface EditForm extends Omit<CheckIn, 'saveGoodsRecordList'> {
  saveGoodsRecordList: GoodsForm[]
}

export interface Filter {
  odd: string
  warehouseId: number | undefined
  pageNum: number
  pageSize: number
}

export interface State {
  didMount: boolean
  shouldUpdate: boolean
  filter: Filter
  data: CheckIn[]
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
  warehouseId: undefined,
  supplierId: undefined,
  signer: '',
  receivedTime: dayjs().valueOf(),
  discount: 1,
  paid: null,
  saveGoodsRecordList: Array(5).fill(getInitialGoods()),
  remark: ''
})

const getInitialEditForm = (): EditForm => ({
  id: NaN,
  ...getInitialAddForm(),
  warehouseId: NaN,
  saveGoodsRecordList: [],
  createTime: dayjs().valueOf()
})

const state: State = {
  didMount: false,
  shouldUpdate: false,
  filter: {
    odd: '',
    warehouseId: undefined,
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

export const checkIn = {
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
      state.addForm.saveGoodsRecordList[index][key] = value
      return state
    },
    addAddFormGoods (state: State): State {
      for (let i = 0; i < 5; i++) {
        state.addForm.saveGoodsRecordList.push(getInitialGoods())
      }
      return state
    },
    deleteAddFormGoods (state: State, index: number): State {
      state.addForm.saveGoodsRecordList.splice(index, 1)
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
      state.editForm.saveGoodsRecordList[index][key] = value
      return state
    },
    addEditFormGoods (state: State): State {
      for (let i = 0; i < 5; i++) {
        state.editForm.saveGoodsRecordList.push(getInitialGoods())
      }
      return state
    },
    deleteEditFormGoods (state: State, index: number) {
      state.editForm.saveGoodsRecordList.splice(index, 1)
      return state
    },
    clearEditForm (state: State) {
      state.editForm = getInitialEditForm()
      return state
    }
  },
  effects: (dispatch: Dispatch) => ({
    async loadCheckIns (_: any, store: RootState) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      const filter: Filter = {
        ...store.checkIn.filter,
        odd: store.checkIn.filter.odd.trim(),
        pageNum: store.checkIn.pageNum,
        pageSize: store.checkIn.pageSize
      }
      cancelTokenSource = axios.CancelToken.source()
      const result = await request.get<Page<CheckIn>, Page<CheckIn>>('/repertory/saveRecord/list', { params: filter, cancelToken: cancelTokenSource.token })
      cancelTokenSource = undefined
      dispatch.checkIn.updateState(result || {})
      dispatch.checkIn.updateFilter({ pageNum: filter.pageNum, pageSize: filter.pageSize })
    },
    async addCheckIn (checkIn: AddForm) {
      await request.post('/repertory/saveRecord/insert', checkIn)
      dispatch.checkIn.loadCheckIns()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(checkIn.warehouseId!)
    },
    async editCheckIn (checkIn: EditForm) {
      await request.put('/repertory/saveRecord/update', checkIn)
      dispatch.checkIn.loadCheckIns()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(checkIn.warehouseId)
    },
    async deleteCheckIn (id: number, store: RootState) {
      const repositoryId = store.checkIn.data.find(item => item.id === id)!.warehouseId
      await request.delete(`/repertory/saveRecord/delete/${id}`)
      dispatch.checkIn.loadCheckIns()
      dispatch.stock.shouldUpdate()
      dispatch.stock.detailShouldUpdate(repositoryId)
    }
  })
}
