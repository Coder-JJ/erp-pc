import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { CheckIn, GoodsForm } from '../../../rematch/models/checkIn'

interface Props {
  children: React.ReactElement
}

const AddForm: React.FC<Props> = function(props) {
  const { children } = props
  const { addForm } = useSelector((store: RootState) => store.checkIn)
  const loading = useSelector((store: RootState) => store.loading.effects.checkIn.addCheckIn)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof CheckIn, value: any) => dispatch.checkIn.updateAddForm({ [key]: value }), [dispatch.checkIn])
  const onGoodsPropChange = useCallback((index: number, key: keyof GoodsForm, value: any) => dispatch.checkIn.updateAddFormGoods({ index, key, value }), [dispatch.checkIn])
  const onAddGoods = useCallback(() => dispatch.checkIn.addAddFormGoods(), [dispatch.checkIn])
  const onDeleteGoods = useCallback((index: number) => dispatch.checkIn.deleteAddFormGoods(index), [dispatch.checkIn])
  const onSave = useCallback(async(form: CheckIn) => {
    await dispatch.checkIn.addCheckIn(form)
    dispatch.checkIn.clearAddForm()
  }, [dispatch.checkIn])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onGoodsPropChange={onGoodsPropChange} onAddGoods={onAddGoods} onDeleteGoods={onDeleteGoods} onSave={onSave} title='新增入库单'>{ children }</BaseForm>
}

export default React.memo(AddForm)
