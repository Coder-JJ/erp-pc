import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import axios, { CancelTokenSource } from 'axios'
import dayjs from 'dayjs'
import { request } from '../../libs'
import { Page } from '../../libs/request'

export interface Collection {
  id: number
  customId: number
  customName: string
  collection: number
  collectionTime: number
  goodsTime: number
}

export interface AddForm {
  customId: number | undefined
  collection: number | undefined
  collectionTime: number
  goodsTime: number
}

export interface EditForm {
  id: number
  customId: number
  collection: number
  collectionTime: number
  goodsTime: number
}

export interface Filter {
  customIds: number[]
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
  collectionTime: dayjs().valueOf(),
  goodsTime: dayjs().valueOf()
})

const state: State = {
  filter: {
    customIds: [],
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
      const result = await request.get<Page<Collection>, Page<Collection>>('/collection/page', {
        params: {
          ...filter,
          customIds: customIds.join(','),
          pageNum,
          pageSize
        },
        cancelToken: cancelTokenSource.token
      })
      cancelTokenSource = undefined
      dispatch.collection.updateState(result || {})
      dispatch.collection.updateFilter({ pageNum, pageSize })
    },
    async addCollection(collection: AddForm) {
      await request.post('/collection', collection)
      dispatch.collection.loadCollections()
      dispatch.bill.shouldUpdate()
    },
    async editCollection(collection: EditForm) {
      await request.put('/collection', collection)
      dispatch.collection.loadCollections()
      dispatch.bill.shouldUpdate()
    },
    async deleteCollection(collection: Collection) {
      await request.delete(`/collection/${collection.id}`)
      dispatch.collection.loadCollections()
      dispatch.bill.shouldUpdate()
    }
  })
})
