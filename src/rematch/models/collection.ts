import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import axios, { CancelTokenSource } from 'axios'
import moment from 'moment'
import { request } from '../../libs'
import { NodePage, nodeRequest } from '../../libs/request'

export enum PaymentPlatform {
  WeChat = 'WeChat',
  AliPay = 'AliPay',
  ABC = 'ABC',
  CCB = 'CCB',
  ICBC = 'ICBC',
  BCM = 'BCM',
  RCC = 'RCC',
  Others = 'Others'
}

export const paymentPlatforms = [
  { value: PaymentPlatform.WeChat, label: '微信' },
  { value: PaymentPlatform.AliPay, label: '支付宝' },
  { value: PaymentPlatform.ABC, label: '农业银行' },
  { value: PaymentPlatform.CCB, label: '建设银行' },
  { value: PaymentPlatform.ICBC, label: '工商银行' },
  { value: PaymentPlatform.BCM, label: '交通银行' },
  { value: PaymentPlatform.RCC, label: '农村信用社' },
  { value: PaymentPlatform.Others, label: '其他' }
]

export interface NodeCollection {
  id: number
  customer: { id: number, name: string }
  amount: number
  collectionTime: number
  belongTime: number
  payer: string | null
  paymentPlatform: PaymentPlatform | null
  remark: string | null
}

export interface Collection {
  id: number
  customId: number
  customName: string
  collection: number
  collectionTime: number
  goodsTime: number
  payer: string | null | undefined
  paymentPlatform: PaymentPlatform | null | undefined
  remark: string | null | undefined
}

export interface AddForm {
  customId: number | undefined
  collection: number | undefined
  collectionTime: number
  goodsTime: number
  payer: string | null | undefined
  paymentPlatform: PaymentPlatform | null | undefined
  remark: string | null | undefined
}

export interface EditForm {
  id: number
  customId: number
  collection: number
  collectionTime: number
  goodsTime: number
  payer: string | null | undefined
  paymentPlatform: PaymentPlatform | null | undefined
  remark: string | null | undefined
}

export interface Filter {
  keyword: string
  customIds: number[]
  paymentPlatform: PaymentPlatform | undefined
  startTime: string | null
  endTime: string | null
  pageNum: number
  pageSize: number
}

export interface State {
  filter: Filter
  data: Collection[]
  total: number | null
  pageNum: number
  pageSize: number
  addForm: AddForm
  editForm: EditForm | undefined
}

let cancelTokenSource: CancelTokenSource | undefined

const getInitialAddForm = (): AddForm => ({
  customId: undefined,
  collection: undefined,
  collectionTime: moment().valueOf(),
  goodsTime: moment().valueOf(),
  payer: undefined,
  paymentPlatform: undefined,
  remark: undefined
})

const state: State = {
  filter: {
    keyword: '',
    customIds: [],
    paymentPlatform: undefined,
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

export const collection = createModel<RootModel>()({
  state,
  reducers: {
    updateState(state: State, keyValues: Partial<State>): State {
      return { ...state, ...keyValues }
    },
    updateFilter(state: State, keyValues: Partial<Filter>): State {
      state.filter = { ...state.filter, ...keyValues }
      return state
    },
    updateAddForm(state: State, keyValues: Partial<AddForm>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.addForm[key as keyof AddForm] = value as never
      }
      return state
    },
    clearAddForm(state: State): State {
      state.addForm = getInitialAddForm()
      return state
    },
    setEditForm(state: State, form: EditForm): State {
      state.editForm = { ...form }
      return state
    },
    updateEditForm(state: State, keyValues: Partial<EditForm>): State {
      state.editForm = { ...(state.editForm || {}), ...keyValues } as any
      return state
    },
    clearEditForm(state: State) {
      state.editForm = undefined
      return state
    }
  },
  effects: dispatch => ({
    async loadCollections(_: any, store) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      const { filter: { customIds, ...filter }, pageNum, pageSize } = store.collection
      cancelTokenSource = axios.CancelToken.source()
      const result = await nodeRequest.post<NodePage<NodeCollection>, NodePage<NodeCollection>>('/collection/page', {
        ...filter,
        customerIds: customIds,
        current: pageNum,
        size: pageSize
      }, {
        cancelToken: cancelTokenSource.token
      })
      cancelTokenSource = undefined
      dispatch.collection.updateState({
        total: result.count,
        data: result.rows.map<Collection>(c => ({
          id: c.id,
          customId: c.customer.id,
          customName: c.customer.name,
          collection: c.amount,
          collectionTime: c.collectionTime,
          goodsTime: c.belongTime,
          payer: c.payer,
          paymentPlatform: c.paymentPlatform,
          remark: c.remark
        }))
      })
      dispatch.collection.updateFilter({ pageNum, pageSize })
    },
    async addCollection(collection: AddForm) {
      await nodeRequest.post('/collection/create', {
        customerId: collection.customId,
        amount: collection.collection,
        belongTime: collection.goodsTime,
        collectionTime: collection.collectionTime,
        payer: collection.payer,
        paymentPlatform: collection.paymentPlatform,
        remark: collection.remark
      })
      dispatch.collection.loadCollections()
      dispatch.customerAccount.shouldUpdate()
      dispatch.bill.shouldUpdate()
    },
    async editCollection(collection: EditForm) {
      await nodeRequest.post('/collection/update', {
        id: collection.id,
        customerId: collection.customId,
        amount: collection.collection,
        belongTime: collection.goodsTime,
        collectionTime: collection.collectionTime,
        payer: collection.payer,
        paymentPlatform: collection.paymentPlatform ?? null,
        remark: collection.remark
      })
      dispatch.collection.loadCollections()
      dispatch.customerAccount.shouldUpdate()
      dispatch.bill.shouldUpdate()
    },
    async deleteCollection(collection: Collection) {
      await request.delete(`/collection/${collection.id}`)
      dispatch.collection.loadCollections()
      dispatch.customerAccount.shouldUpdate()
      dispatch.bill.shouldUpdate()
    }
  })
})
