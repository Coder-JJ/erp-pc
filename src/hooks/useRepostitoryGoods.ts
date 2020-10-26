import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Goods } from '../rematch/models/goods'

const useRepostitoryGoods = (): Goods[] => {
  const goods = useSelector((store: RootState) => store.goods.data)
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!goods.length) {
      dispatch.goods.loadGoods()
    }
  }, [goods.length, dispatch.goods])
  return goods
}

export default useRepostitoryGoods
