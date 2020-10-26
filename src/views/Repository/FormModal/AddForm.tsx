import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BaseForm from './BaseForm'
import { RootState, Dispatch } from '../../../rematch'
import { Repository } from '../../../rematch/models/repository'

interface Props {
  onSave? (id: number): void
  children: React.ReactElement
}

const AddForm: React.FC<Props> = function (props) {
  const { onSave: onSaveRepository, children } = props
  const { addForm } = useSelector((store: RootState) => store.repository)
  const loading = useSelector((store: RootState) => store.loading.effects.repository.addRepository)
  const dispatch = useDispatch<Dispatch>()

  const onChange = useCallback((key: keyof Repository, value: any) => dispatch.repository.updateAddForm({ [key]: value }), [dispatch.repository])
  const onSave = useCallback(async (form: Repository) => {
    const id = await dispatch.repository.addRepository(form)
    onSaveRepository && onSaveRepository(id)
    dispatch.repository.clearAddForm()
  }, [onSaveRepository, dispatch.repository])

  return <BaseForm value={addForm} saving={loading} onChange={onChange} onSave={onSave} title='新增仓库'>{ children }</BaseForm>
}

export default React.memo(AddForm)
