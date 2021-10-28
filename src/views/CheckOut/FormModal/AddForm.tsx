import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { CheckOut, GoodsForm } from '../../../rematch/models/checkOut'

interface Props {
  children: React.ReactElement
}

const AddForm: React.FC<Props> = function (props) {
  const { children } = props
  const { addForm } = useSelector((store: RootState) => store.checkOut)
  const loading = useSelector((store: RootState) => store.loading.effects.checkOut.addCheckOut)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof CheckOut, value: any) => dispatch.checkOut.updateAddForm({ [key]: value }), [dispatch.checkOut])
  const onGoodsPropChange = useCallback((index: number, key: keyof GoodsForm, value: any) => dispatch.checkOut.updateAddFormGoods({ index, key, value }), [dispatch.checkOut])
  const onAddGoods = useCallback(() => dispatch.checkOut.addAddFormGoods(), [dispatch.checkOut])
  const onResetGoodsProps = useCallback((index: number) => dispatch.checkOut.resetAddFormGoodsProps(index), [dispatch.checkOut])
  const onSave = useCallback(async (form: CheckOut) => {
    await dispatch.checkOut.addCheckOut(form)
    dispatch.checkOut.clearAddForm()
  }, [dispatch.checkOut])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onGoodsPropChange={onGoodsPropChange} onAddGoods={onAddGoods} onResetGoodsProps={onResetGoodsProps} onSave={onSave} title='新增入库单'>{ children }</BaseForm>
}

export default React.memo(AddForm)
