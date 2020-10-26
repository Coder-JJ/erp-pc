import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Supplier } from '../rematch/models/supplier'

const useSuppliers = (): [Supplier[], Supplier[]] => {
  const data = useSelector((store: RootState) => store.supplier.data)
  const keyword = useSelector((store: RootState) => store.supplier.keyword.trim())
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!data.length) {
      dispatch.supplier.loadSuppliers()
    }
  }, [data.length, dispatch.supplier])
  const suppliers = useMemo(() => data.length ? data.filter(({ name, leader, leaderPhone, address, addressDetail, remark }) => name.includes(keyword) || leader.includes(keyword) || leaderPhone.includes(keyword) || address.includes(keyword) || addressDetail.includes(keyword) || remark.includes(keyword)) : data, [keyword, data])
  return [data, suppliers]
}

export default useSuppliers
