import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Goods } from '../../../rematch/models/goods'

interface Props {
  children: React.ReactElement
}

const EditForm: React.FC<Props> = function(props) {
  const { children } = props
  const { editForm } = useSelector((store: RootState) => store.goods)
  const loading = useSelector((store: RootState) => store.loading.effects.goods.editGoods)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Goods, value: any) => dispatch.goods.updateEditForm({ [key]: value }), [dispatch.goods])
  const onSave = useCallback(async(form: Goods) => {
    await dispatch.goods.editGoods(form)
    dispatch.goods.clearEditForm()
  }, [dispatch.goods])

  return <BaseForm value={editForm} saving={loading} onChange={onChange} onSave={onSave} title='编辑货物'>{ children }</BaseForm>
}

export default React.memo(EditForm)
