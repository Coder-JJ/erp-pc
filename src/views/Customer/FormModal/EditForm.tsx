import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Customer } from '../../../rematch/models/customer'

interface Props {
  children: React.ReactElement
}

const EditForm: React.FC<Props> = function (props) {
  const { children } = props
  const { editForm } = useSelector((store: RootState) => store.customer)
  const loading = useSelector((store: RootState) => store.loading.effects.customer.editCustomer)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Customer, value: any) => dispatch.customer.updateEditForm({ [key]: value }), [dispatch.customer])
  const onSave = useCallback(async (form: Customer) => {
    await dispatch.customer.editCustomer(form)
    dispatch.customer.clearEditForm()
  }, [dispatch.customer])

  return <BaseForm value={editForm} saving={loading} onChange={onChange} onSave={onSave} title='编辑客户'>{ children }</BaseForm>
}

export default React.memo(EditForm)
