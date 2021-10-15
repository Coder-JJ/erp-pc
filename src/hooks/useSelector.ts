import { useSelector } from 'react-redux'
import { RootState } from '../rematch'

const useHook = <TState = RootState, TSelected = unknown>(
  selector: (state: TState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
): TSelected => useSelector(selector, equalityFn)

export default useHook
