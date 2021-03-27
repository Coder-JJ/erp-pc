import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { StockDetail } from '../rematch/models/stock'

const useRepostitoryGoods = (id: number): StockDetail[] => {
  const { detailsDidMount, detailsShouldUpdate, details } = useSelector((store: RootState) => store.stock)
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!detailsDidMount[id] || detailsShouldUpdate[id]) {
      dispatch.stock.loadStockDetail(id)
      dispatch.stock.detailDidMount(id)
      dispatch.stock.detailDidUpdate(id)
    }
  }, [detailsDidMount, detailsShouldUpdate, id, dispatch.stock])
  return details[id] || []
}

export default useRepostitoryGoods
