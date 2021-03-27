import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { Repository } from '../rematch/models/repository'

const useRepositories = (): [Repository[], Repository[]] => {
  const { didMount, shouldUpdate, data } = useSelector((store: RootState) => store.repository)
  const keyword = useSelector((store: RootState) => store.repository.keyword.trim())
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!didMount || shouldUpdate) {
      dispatch.repository.loadRepositories()
      dispatch.repository.updateState({ didMount: true, shouldUpdate: false })
    }
  }, [didMount, shouldUpdate, dispatch.repository])
  const repositories = useMemo(() => data.length ? data.filter(({ name, leader, leaderPhone, remark }) => name.includes(keyword) || leader.includes(keyword) || leaderPhone.includes(keyword) || remark.includes(keyword)) : data, [keyword, data])
  return [data, repositories]
}

export default useRepositories
