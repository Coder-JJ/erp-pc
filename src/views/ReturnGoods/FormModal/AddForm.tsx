import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ModalProps } from 'antd/lib/modal'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { ReturnGoods, GoodsForm } from '../../../rematch/models/returnGoods'

export interface Props extends Omit<ModalProps, 'children'> {
  children?: React.ReactElement
}

const AddForm: React.FC<Props> = function(props) {
  const { addForm } = useSelector((store: RootState) => store.returnGoods)
  const loading = useSelector((store: RootState) => store.loading.effects.returnGoods.addReturnGoods)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof ReturnGoods, value: any) => dispatch.returnGoods.updateAddForm({ [key]: value }), [dispatch.returnGoods])
  const onGoodsPropChange = useCallback((index: number, key: keyof GoodsForm, value: any) => dispatch.returnGoods.updateAddFormGoods({ index, key, value }), [dispatch.returnGoods])
  const onAddGoods = useCallback(() => dispatch.returnGoods.addAddFormGoods(), [dispatch.returnGoods])
  const onResetGoodsProps = useCallback((index: number) => dispatch.returnGoods.resetAddFormGoodsProps(index), [dispatch.returnGoods])
  const onSave = useCallback(async(form: ReturnGoods) => {
    await dispatch.returnGoods.addReturnGoods(form)
    dispatch.returnGoods.clearAddForm()
  }, [dispatch.returnGoods])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onGoodsPropChange={onGoodsPropChange} onAddGoods={onAddGoods} onResetGoodsProps={onResetGoodsProps} onSave={onSave} title='新增退货单' {...props} />
}

export default React.memo(AddForm)
