import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ModalProps } from 'antd/lib/modal'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Collection } from '../../../rematch/models/collection'
import { usePersistFn } from 'ahooks'
import { FlatCustomerAccount } from '../../../rematch/models/customerAccount'
import moment from 'moment'

export interface Props extends Omit<ModalProps, 'children'> {
  customerAccount?: FlatCustomerAccount
  children?: React.ReactElement
}

const AddForm: React.FC<Props> = function({ customerAccount, ...props }) {
  const { addForm } = useSelector((store: RootState) => store.collection)
  const loading = useSelector((store: RootState) => store.loading.effects.collection.addCollection)
  const dispatch = useDispatch<Dispatch>()

  const onCancel = usePersistFn(() => dispatch.collection.clearAddForm())
  const onChange = useCallback((key: keyof Collection, value: any) => dispatch.collection.updateAddForm({ [key]: value }), [dispatch.collection])
  const onSave = useCallback(async(form: Collection) => {
    await dispatch.collection.addCollection(form)
    dispatch.collection.clearAddForm()
  }, [dispatch.collection])

  const onOpen = usePersistFn(() => {
    if (customerAccount) {
      dispatch.collection.updateAddForm({
        customId: customerAccount.id,
        goodsTime: moment(customerAccount.billMonth).valueOf(),
        collection: customerAccount.billAmount - customerAccount.paidAmount - customerAccount.refundAmount
      })
    }
  })

  return <BaseForm value={addForm} customerAccount={customerAccount} saving={loading} onOpen={onOpen} onChange={onChange} onSave={onSave} title='新增收款记录' {...props} onCancel={onCancel} />
}

export default React.memo(AddForm)
