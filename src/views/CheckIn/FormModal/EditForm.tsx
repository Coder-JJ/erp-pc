import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { CheckIn, GoodsForm } from '../../../rematch/models/checkIn'

interface Props {
  children: React.ReactElement
}

const EditForm: React.FC<Props> = function(props) {
  const { children } = props
  const { editForm } = useSelector((store: RootState) => store.checkIn)
  const loading = useSelector((store: RootState) => store.loading.effects.checkIn.editCheckIn)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof CheckIn, value: any) => dispatch.checkIn.updateEditForm({ [key]: value }), [dispatch.checkIn])
  const onGoodsPropChange = useCallback((index: number, key: keyof GoodsForm, value: any) => dispatch.checkIn.updateEditFormGoods({ index, key, value }), [dispatch.checkIn])
  const onAddGoods = useCallback(() => dispatch.checkIn.addEditFormGoods(), [dispatch.checkIn])
  const onDeleteGoods = useCallback((index: number) => dispatch.checkIn.deleteEditFormGoods(index), [dispatch.checkIn])
  const onSave = useCallback(async(form: CheckIn) => {
    await dispatch.checkIn.editCheckIn(form)
    dispatch.checkIn.clearEditForm()
  }, [dispatch.checkIn])

  return <BaseForm value={editForm} saving={loading} onChange={onChange} onGoodsPropChange={onGoodsPropChange} onAddGoods={onAddGoods} onDeleteGoods={onDeleteGoods} onSave={onSave} title='编辑入库单'>{ children }</BaseForm>
}

export default React.memo(EditForm)
