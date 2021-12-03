import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ModalProps } from 'antd/lib/modal'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { CheckOut, GoodsForm } from '../../../rematch/models/checkOut'

export interface Props extends Omit<ModalProps, 'children'> {
  children?: React.ReactElement
}

const EditForm: React.FC<Props> = function (props) {
  const { editForm } = useSelector((store: RootState) => store.checkOut)
  const loading = useSelector((store: RootState) => store.loading.effects.checkOut.editCheckOut)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof CheckOut, value: any) => dispatch.checkOut.updateEditForm({ [key]: value }), [dispatch.checkOut])
  const onGoodsPropChange = useCallback((index: number, key: keyof GoodsForm, value: any) => dispatch.checkOut.updateEditFormGoods({ index, key, value }), [dispatch.checkOut])
  const onAddGoods = useCallback(() => dispatch.checkOut.addEditFormGoods(), [dispatch.checkOut])
  const onResetGoodsProps = useCallback((index: number) => dispatch.checkOut.resetEditFormGoodsProps(index), [dispatch.checkOut])
  const onSave = useCallback(async (form: CheckOut) => {
    await dispatch.checkOut.editCheckOut(form)
    dispatch.checkOut.clearEditForm()
  }, [dispatch.checkOut])

  return <BaseForm value={editForm} saving={loading} onChange={onChange} onGoodsPropChange={onGoodsPropChange} onAddGoods={onAddGoods} onResetGoodsProps={onResetGoodsProps} onSave={onSave} title='编辑出库单' {...props} />
}

export default React.memo(EditForm)
