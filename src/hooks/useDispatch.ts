import { useDispatch } from 'react-redux'
import { Dispatch } from '../rematch'

const useHook = (): Dispatch => useDispatch<Dispatch>()

export default useHook
