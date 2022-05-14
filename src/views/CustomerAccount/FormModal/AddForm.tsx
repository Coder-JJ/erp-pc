import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ModalProps } from 'antd/lib/modal'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Collection } from '../../../rematch/models/collection'

export interface Props extends Omit<ModalProps, 'children'> {
  children?: React.ReactElement
}

const AddForm: React.FC<Props> = function(props) {
  const { addForm } = useSelector((store: RootState) => store.collection)
  const loading = useSelector((store: RootState) => store.loading.effects.collection.addCollection)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Collection, value: any) => dispatch.collection.updateAddForm({ [key]: value }), [dispatch.collection])
  const onSave = useCallback(async(form: Collection) => {
    await dispatch.collection.addCollection(form)
    dispatch.collection.clearAddForm()
  }, [dispatch.collection])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onSave={onSave} title='新增收款记录' {...props} />
}

export default React.memo(AddForm)
