import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Goods } from '../rematch/models/goods'

const useGoods = (): [Goods[], Goods[]] => {
  const { didMount, shouldUpdate, data } = useSelector((store: RootState) => store.goods)
  const keyword = useSelector((store: RootState) => store.goods.keyword.trim())
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!didMount || shouldUpdate) {
      dispatch.goods.loadGoods()
      dispatch.goods.updateState({ didMount: true, shouldUpdate: false })
    }
  }, [didMount, shouldUpdate, dispatch.goods])
  const goods = useMemo(() => data.length ? data.filter(({ name, brand, texture, size, remark }) => name.includes(keyword) || brand.includes(keyword) || texture.includes(keyword) || size.includes(keyword) || remark.includes(keyword)) : data, [keyword, data])
  return [data, goods]
}

export default useGoods
