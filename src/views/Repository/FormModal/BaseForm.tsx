import React, { useState, useCallback } from 'react'
import { Modal, message, Form, Input, InputNumber } from 'antd'
import { AddForm as Repository } from '../../../rematch/models/repository'

interface Props {
  title: string
  value: Repository
  saving: boolean
  onChange (key: keyof Repository, value: any): void
  onSave (form: Repository): Promise<void>
  children: React.ReactElement
}

const BaseForm: React.FC<Props> = function (props) {
  const { title, value, saving, onChange, onSave, children } = props

  const [visible, setVisible] = useState(false)
  const openModal = useCallback(() => setVisible(true), [])
  const closeModal = useCallback(() => !saving && setVisible(false), [saving])

  const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('name', e.target.value), [onChange])
  const onLeaderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('leader', e.target.value), [onChange])
  const onLeaderPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('leaderPhone', e.target.value), [onChange])
  const onRemarkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('remark', e.target.value), [onChange])
  const onSortChange = useCallback((value: string | number | undefined) => onChange('sort', value), [onChange])

  const onOk = useCallback(async () => {
    const form: Repository = {
      ...value,
      name: value.name.trim(),
      leader: value.leader.trim(),
      leaderPhone: value.leaderPhone.trim(),
      remark: value.remark.trim(),
      sort: typeof value.sort === 'number' ? value.sort : 0
    }
    if (!form.name) {
      message.error('请输入仓库名称')
      return
    }
    await onSave(form)
    closeModal()
  }, [value, onSave, closeModal])

  return (
    <>
      { React.cloneElement(children, { onClick: openModal }) }
      <Modal visible={visible} onOk={onOk} onCancel={closeModal} title={title} confirmLoading={saving} zIndex={2000}>
        <Form layout='vertical'>
          <Form.Item label='仓库名称' required>
            <Input value={value.name} onChange={onNameChange} placeholder='请输入仓库名称' />
          </Form.Item>
          <Form.Item label='负责人'>
            <Input value={value.leader} onChange={onLeaderChange} placeholder='请输入负责人姓名' />
          </Form.Item>
          <Form.Item label='负责人手机号码'>
            <Input value={value.leaderPhone} onChange={onLeaderPhoneChange} placeholder='请输入负责人手机号码' />
          </Form.Item>
          <Form.Item label='备注'>
            <Input value={value.remark} onChange={onRemarkChange} placeholder='请输入备注' />
          </Form.Item>
          <Form.Item label='顺序号'>
            <InputNumber value={value.sort} onChange={onSortChange} placeholder='请输入顺序号' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
