import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Goods } from '../rematch/models/goods'

const useGoods = (): [Goods[], Goods[]] => {
  const data = useSelector((store: RootState) => store.goods.data)
  const keyword = useSelector((store: RootState) => store.goods.keyword.trim())
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!data.length) {
      dispatch.goods.loadGoods()
    }
  }, [data.length, dispatch.goods])
  const goods = useMemo(() => data.length ? data.filter(({ name, brand, texture, size, remark }) => name.includes(keyword) || brand.includes(keyword) || texture.includes(keyword) || size.includes(keyword) || remark.includes(keyword)) : data, [keyword, data])
  return [data, goods]
}

export default useGoods
