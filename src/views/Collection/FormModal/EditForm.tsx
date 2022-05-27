import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ModalProps } from 'antd/lib/modal'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Collection } from '../../../rematch/models/collection'

export interface Props extends Omit<ModalProps, 'children'> {
  record: Collection | undefined
  children?: React.ReactElement
}

const EditForm: React.FC<Props> = function(props) {
  const { editForm } = useSelector((store: RootState) => store.collection)
  const loading = useSelector((store: RootState) => store.loading.effects.collection.editCollection)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Collection, value: any) => dispatch.collection.updateEditForm({ [key]: value }), [dispatch.collection])
  const onSave = useCallback(async(form: Collection) => {
    await dispatch.collection.editCollection(form)
    dispatch.collection.clearEditForm()
  }, [dispatch.collection])

  return <BaseForm value={editForm} saving={loading} onChange={onChange} onSave={onSave} title='编辑收款记录' {...props} />
}

export default React.memo(EditForm)
