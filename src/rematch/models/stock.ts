import { request } from '../../libs'
import { Dispatch } from '../../rematch'

export interface StockOverview {
  warehouseId: number
  warehouseName: string
  types: number
  num: number
}

export interface StockDetail {
  warehouseId: number
  warehouseName: string
  goodId: number
  goodName: string
  goodBrand: string
  goodSize: string
  goodTexture: string
  goodPrice: number | null
  goodRemark: string
  num: number
}

export interface StockDetails {
  [key: string]: StockDetail[]
}

export interface State {
  didMount: boolean
  shouldUpdate: boolean
  detailsDidMount: {
    [key: string]: boolean
  }
  detailsShouldUpdate: {
    [key: string]: boolean
  }
  overviews: StockOverview[]
  details: StockDetails
  detailFilter: string
}

const state: State = {
  didMount: false,
  shouldUpdate: false,
  detailsDidMount: {},
  detailsShouldUpdate: {},
  overviews: [],
  details: {},
  detailFilter: ''
}

export const stock = {
  state,
  reducers: {
    shouldUpdate (state: State): State {
      state.shouldUpdate = true
      return state
    },
    detailDidMount (state: State, id: number): State {
      state.detailsDidMount[id] = true
      return state
    },
    detailShouldUpdate (state: State, id: number): State {
      state.detailsShouldUpdate[id] = true
      return state
    },
    detailDidUpdate (state: State, id: number): State {
      state.detailsShouldUpdate[id] = false
      return state
    },
    updateState (state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as never
      }
      return state
    },
    updateDetails (state: State, { id, data }: { id: number, data: StockDetail[] }): State {
      state.details[id] = data
      return state
    }
  },
  effects: (dispatch: Dispatch) => ({
    async loadStockOverviews () {
      const overviews = await request.get<StockOverview[], StockOverview[]>('/warehouse/statistics')
      dispatch.stock.updateState({ overviews })
    },
    async loadStockDetail (id: number) {
      const data = await request.get<StockDetail[], StockDetail[]>(`/warehouse/repertory/${id}`)
      dispatch.stock.updateDetails({ id, data })
    }
  })
}
