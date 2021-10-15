import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Supplier } from '../rematch/models/supplier'

let loaded: boolean = false

const useSuppliers = (): [Supplier[], Supplier[]] => {
  const { didMount, shouldUpdate, data } = useSelector((store: RootState) => store.supplier)
  const keyword = useSelector((store: RootState) => store.supplier.keyword.trim())
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if ((!didMount && !loaded) || shouldUpdate) {
      try {
        loaded = true
        dispatch.supplier.loadSuppliers()
        dispatch.supplier.updateState({ didMount: true, shouldUpdate: false })
      } catch (e) {
        console.error(e)
        if (!didMount) {
          loaded = false
        }
      }
    }
  }, [didMount, shouldUpdate, dispatch.supplier])
  const suppliers = useMemo(() => data.length ? data.filter(({ name, leader, leaderPhone, address, addressDetail, remark }) => name.toLowerCase().includes(keyword.toLowerCase()) || leader.includes(keyword) || leaderPhone.includes(keyword) || address.includes(keyword) || addressDetail.includes(keyword) || remark.includes(keyword)) : data, [keyword, data])
  return [data, suppliers]
}

export default useSuppliers
