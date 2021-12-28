import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ModalProps } from 'antd/lib/modal'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { ReturnGoods, GoodsForm } from '../../../rematch/models/returnGoods'

export interface Props extends Omit<ModalProps, 'children'> {
  children?: React.ReactElement
}

const EditForm: React.FC<Props> = function(props) {
  const { editForm } = useSelector((store: RootState) => store.returnGoods)
  const loading = useSelector((store: RootState) => store.loading.effects.returnGoods.editReturnGoods)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof ReturnGoods, value: any) => dispatch.returnGoods.updateEditForm({ [key]: value }), [dispatch.returnGoods])
  const onGoodsPropChange = useCallback((index: number, key: keyof GoodsForm, value: any) => dispatch.returnGoods.updateEditFormGoods({ index, key, value }), [dispatch.returnGoods])
  const onAddGoods = useCallback(() => dispatch.returnGoods.addEditFormGoods(), [dispatch.returnGoods])
  const onResetGoodsProps = useCallback((index: number) => dispatch.returnGoods.resetEditFormGoodsProps(index), [dispatch.returnGoods])
  const onSave = useCallback(async(form: ReturnGoods) => {
    await dispatch.returnGoods.editReturnGoods(form)
    dispatch.returnGoods.clearEditForm()
  }, [dispatch.returnGoods])

  return <BaseForm value={editForm} saving={loading} onChange={onChange} onGoodsPropChange={onGoodsPropChange} onAddGoods={onAddGoods} onResetGoodsProps={onResetGoodsProps} onSave={onSave} title='编辑退货单' {...props} />
}

export default React.memo(EditForm)
