import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Goods } from '../../../rematch/models/goods'

interface Props {
  onSave? (goods: Goods): void
  children: React.ReactElement
}

const AddForm: React.FC<Props> = function(props) {
  const { onSave: onSaveGoods, children } = props
  const { addForm } = useSelector((store: RootState) => store.goods)
  const loading = useSelector((store: RootState) => store.loading.effects.goods.addGoods)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Goods, value: any) => dispatch.goods.updateAddForm({ [key]: value }), [dispatch.goods])
  const onSave = useCallback(async(form: Goods) => {
    const id = await dispatch.goods.addGoods(form)
    onSaveGoods && onSaveGoods({ ...form, id })
    dispatch.goods.clearAddForm()
  }, [onSaveGoods, dispatch.goods])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onSave={onSave} title='新增货物'>{ children }</BaseForm>
}

export default React.memo(AddForm)
