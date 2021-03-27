import axios, { CancelTokenSource } from 'axios'
import { request } from '../../libs'
import { Dispatch, RootState } from '../../rematch'

export interface Repository {
  id: number
  name: string
  leader: string
  leaderPhone: string
  remark: string
  sort: number
}

export type AddForm = Omit<Repository, 'id'>

export interface State {
  didMount: boolean
  shouldUpdate: boolean
  keyword: string
  data: Repository[]
  addForm: AddForm
  editForm: Repository
}

let cancelTokenSource: CancelTokenSource | undefined

const getInitialAddForm = (): AddForm => ({
  name: '',
  leader: '',
  leaderPhone: '',
  remark: '',
  sort: 0
})

const getInitialEditForm = (): Repository => ({
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

export const repository = {
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
    updateEditForm (state: State, keyValues: Partial<Repository>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.editForm[key as keyof Repository] = value as never
      }
      return state
    },
    clearEditForm (state: State) {
      state.editForm = getInitialEditForm()
      return state
    }
  },
  effects: (dispatch: Dispatch) => ({
    async loadRepositories (_: any, store: RootState) {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('cancel repetitive request.')
      }
      cancelTokenSource = axios.CancelToken.source()
      const data = await request.get<Repository[], Repository[]>('/warehouse/list', { cancelToken: cancelTokenSource.token })
      cancelTokenSource = undefined
      dispatch.repository.updateState({ data })
    },
    async addRepository (repository: AddForm) {
      const id = await request.post<number, number>('/warehouse/insert', repository)
      dispatch.repository.shouldUpdate()
      return id
    },
    async editRepository (repository: Repository) {
      await request.put('/warehouse/update', repository)
      dispatch.repository.shouldUpdate()
    },
    async deleteRepository (id: number) {
      await request.delete(`/warehouse/delete/${id}`)
      dispatch.repository.shouldUpdate()
    }
  })
}
