import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Goods } from '../rematch/models/goods'

let loaded: boolean = false

const useGoods = (): [Goods[], Goods[]] => {
  const { didMount, shouldUpdate, data } = useSelector((store: RootState) => store.goods)
  const keyword = useSelector((store: RootState) => store.goods.keyword.trim())
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if ((!didMount && !loaded) || shouldUpdate) {
      try {
        loaded = true
        dispatch.goods.loadGoods()
        dispatch.goods.updateState({ didMount: true, shouldUpdate: false })
      } catch (e) {
        console.error(e)
        if (!didMount) {
          loaded = false
        }
      }
    }
  }, [didMount, shouldUpdate, dispatch.goods])
  const goods = useMemo(() => data.length ? data.filter(({ name, brand, texture, size, remark }) => name.toLowerCase().includes(keyword.toLowerCase()) || brand.toLowerCase().includes(keyword.toLowerCase()) || texture.includes(keyword) || size.includes(keyword) || remark.includes(keyword)) : data, [keyword, data])
  return [data, goods]
}

export default useGoods
