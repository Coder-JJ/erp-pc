import React, { useState, useCallback } from 'react'
import { Modal, message, Form, Input } from 'antd'
import { Supplier } from '../../../rematch/models/supplier'

interface Props {
  title: string
  value: Supplier
  saving: boolean
  onChange (key: keyof Supplier, value: any): void
  onSave (form: Supplier): Promise<void>
  children: React.ReactElement
}

const BaseForm: React.FC<Props> = function (props) {
  const { title, value: { code, name }, saving, onChange, onSave, children } = props

  const [visible, setVisible] = useState(false)
  const openModal = useCallback(() => setVisible(true), [])
  const closeModal = useCallback(() => setVisible(false), [])

  const onCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('code', e.target.value), [onChange])
  const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('name', e.target.value), [onChange])

  const onOk = useCallback(async () => {
    const form: Supplier = {
      code: code.replace(/\s/g, ''),
      name: name.replace(/\s/g, '')
    }
    if (!code) {
      message.error('请输入供应商代码')
      return
    }
    if (!name) {
      message.error('请输入供应商名称')
      return
    }
    await onSave(form)
    closeModal()
  }, [code, name, onSave, closeModal])

  return (
    <>
      { React.cloneElement(children, { onClick: openModal }) }
      <Modal visible={visible} onOk={onOk} onCancel={closeModal} title={title} confirmLoading={saving}>
        <Form>
          <Form.Item label='供应商代码'>
            <Input value={code} onChange={onCodeChange} placeholder='请输入供应商代码' />
          </Form.Item>
          <Form.Item label='供应商名称'>
            <Input value={name} onChange={onNameChange} placeholder='请输入供应商名称' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
