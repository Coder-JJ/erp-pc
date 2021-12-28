import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Repository } from '../../../rematch/models/repository'

interface Props {
  children: React.ReactElement
}

const EditForm: React.FC<Props> = function(props) {
  const { children } = props
  const { editForm } = useSelector((store: RootState) => store.repository)
  const loading = useSelector((store: RootState) => store.loading.effects.repository.editRepository)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Repository, value: any) => dispatch.repository.updateEditForm({ [key]: value }), [dispatch.repository])
  const onSave = useCallback(async(form: Repository) => {
    await dispatch.repository.editRepository(form)
    dispatch.repository.clearEditForm()
  }, [dispatch.repository])

  return <BaseForm value={editForm} saving={loading} onChange={onChange} onSave={onSave} title='编辑仓库'>{ children }</BaseForm>
}

export default React.memo(EditForm)
