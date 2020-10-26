import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Supplier } from '../../../rematch/models/supplier'

interface Props {
  children: React.ReactElement
}

const EditForm: React.FC<Props> = function (props) {
  const { children } = props
  const { editForm } = useSelector((store: RootState) => store.supplier)
  const loading = useSelector((store: RootState) => store.loading.effects.supplier.editSupplier)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Supplier, value: any) => dispatch.supplier.updateEditForm({ [key]: value }), [dispatch.supplier])
  const onSave = useCallback(async (form: Supplier) => {
    await dispatch.supplier.editSupplier(form)
    dispatch.supplier.clearEditForm()
  }, [dispatch.supplier])

  return <BaseForm value={editForm} saving={loading} onChange={onChange} onSave={onSave} title='编辑供应商'>{ children }</BaseForm>
}

export default React.memo(EditForm)
