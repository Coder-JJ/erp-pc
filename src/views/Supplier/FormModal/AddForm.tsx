import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Supplier } from '../../../rematch/models/supplier'

interface Props {
  onSave? (id: number): void
  children: React.ReactElement
}

const AddForm: React.FC<Props> = function(props) {
  const { onSave: onSaveSupplier, children } = props
  const { addForm } = useSelector((store: RootState) => store.supplier)
  const loading = useSelector((store: RootState) => store.loading.effects.supplier.addSupplier)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Supplier, value: any) => dispatch.supplier.updateAddForm({ [key]: value }), [dispatch.supplier])
  const onSave = useCallback(async(form: Supplier) => {
    const id = await dispatch.supplier.addSupplier(form)
    onSaveSupplier && onSaveSupplier(id)
    dispatch.supplier.clearAddForm()
  }, [onSaveSupplier, dispatch.supplier])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onSave={onSave} title='新增供应商'>{ children }</BaseForm>
}

export default React.memo(AddForm)
