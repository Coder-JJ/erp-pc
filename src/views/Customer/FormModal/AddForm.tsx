import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Customer } from '../../../rematch/models/customer'

interface Props {
  children: React.ReactElement
}

const AddForm: React.FC<Props> = function (props) {
  const { children } = props
  const { addForm } = useSelector((store: RootState) => store.customer)
  const loading = useSelector((store: RootState) => store.loading.effects.customer.addCustomer)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Customer, value: any) => dispatch.customer.updateAddForm({ [key]: value }), [dispatch.customer])
  const onSave = useCallback(async (form: Customer) => {
    await dispatch.customer.addCustomer(form)
    dispatch.customer.clearAddForm()
  }, [dispatch.customer])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onSave={onSave} title='新增客户'>{ children }</BaseForm>
}

export default React.memo(AddForm)
