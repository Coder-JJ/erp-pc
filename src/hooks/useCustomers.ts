import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Customer } from '../rematch/models/customer'

let loaded: boolean = false

const useCustomers = (keyword?: string): Customer[] => {
  const { didMount, shouldUpdate, data } = useSelector((store: RootState) => store.customer)
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if ((!didMount && !loaded) || shouldUpdate) {
      try {
        loaded = true
        dispatch.customer.loadCustomers()
        dispatch.customer.updateState({ didMount: true, shouldUpdate: false })
      } catch (e) {
        console.error(e)
        if (!didMount) {
          loaded = false
        }
      }
    }
  }, [didMount, shouldUpdate, dispatch.customer])
  const finalKeyword = useMemo(() => (keyword?.trim() || '').toLowerCase(), [keyword])
  return useMemo<Customer[]>(() => {
    return data.filter(({ name, leader, leaderPhone, address, addressDetail, remark }) => {
      return name.toLowerCase().includes(finalKeyword) || leader?.toLowerCase().includes(finalKeyword) || leaderPhone?.toLowerCase().includes(finalKeyword) || address?.toLowerCase().includes(finalKeyword) || addressDetail?.toLowerCase().includes(finalKeyword) || remark?.toLowerCase().includes(finalKeyword)
    })
  }, [data, finalKeyword])
}

export default useCustomers
