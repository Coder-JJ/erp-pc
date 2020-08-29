import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch, LoadingState } from '../../../rematch'
import { Supplier } from '../../../rematch/models/supplier'

interface Props {
  children: React.ReactElement
}

const AddForm: React.FC<Props> = function (props) {
  const { children } = props
  const { addForm } = useSelector((state: RootState) => state.supplier)
  const loading = useSelector((state: LoadingState) => state.loading.effects.supplier.addSupplier)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Supplier, value: any) => dispatch.supplier.updateAddForm({ [key]: value }), [dispatch.supplier])
  const onSave = useCallback(async (form: Supplier) => {
    await dispatch.supplier.addSupplier(form)
    dispatch.supplier.clearAddForm()
  }, [dispatch.supplier])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onSave={onSave} title='新增供应商'>{ children }</BaseForm>
}

export default React.memo(AddForm)
