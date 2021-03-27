import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Supplier } from '../rematch/models/supplier'

const useSuppliers = (): [Supplier[], Supplier[]] => {
  const { didMount, shouldUpdate, data } = useSelector((store: RootState) => store.supplier)
  const keyword = useSelector((store: RootState) => store.supplier.keyword.trim())
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!didMount || shouldUpdate) {
      dispatch.supplier.loadSuppliers()
      dispatch.supplier.updateState({ didMount: true, shouldUpdate: false })
    }
  }, [didMount, shouldUpdate, dispatch.supplier])
  const suppliers = useMemo(() => data.length ? data.filter(({ name, leader, leaderPhone, address, addressDetail, remark }) => name.includes(keyword) || leader.includes(keyword) || leaderPhone.includes(keyword) || address.includes(keyword) || addressDetail.includes(keyword) || remark.includes(keyword)) : data, [keyword, data])
  return [data, suppliers]
}

export default useSuppliers
