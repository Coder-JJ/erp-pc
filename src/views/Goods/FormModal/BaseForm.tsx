import React, { useState, useCallback } from 'react'
import { Modal, message, Form, Input } from 'antd'
import { AddForm as Goods } from '../../../rematch/models/goods'
import { PriceInput } from '../../../components'

interface Props {
  title: string
  value: Goods
  saving: boolean
  onChange (key: keyof Goods, value: any): void
  onSave (form: Goods): Promise<void>
  children: React.ReactElement
}

const BaseForm: React.FC<Props> = function (props) {
  const { title, value, saving, onChange, onSave, children } = props

  const [visible, setVisible] = useState(false)
  const openModal = useCallback(() => setVisible(true), [])
  const closeModal = useCallback(() => !saving && setVisible(false), [saving])

  const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('name', e.target.value), [onChange])
  const onBrandChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('brand', e.target.value), [onChange])
  const onMaterialChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('texture', e.target.value), [onChange])
  const onSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('size', e.target.value), [onChange])
  const onRemarkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('remark', e.target.value), [onChange])
  const onPriceChange = useCallback((value: string | number | undefined) => onChange('price', value), [onChange])

  const onOk = useCallback(async () => {
    const form: Goods = {
      ...value,
      name: value.name.trim(),
      brand: value.brand.trim(),
      texture: value.texture.trim(),
      size: value.size.trim(),
      price: typeof value.price === 'number' ? value.price : null,
      remark: value.remark.trim()
    }
    if (!form.name) {
      message.error('请输入货物名称')
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
          <Form.Item label='货物名称' required>
            <Input value={value.name} onChange={onNameChange} placeholder='请输入货物名称' />
          </Form.Item>
          <Form.Item label='商标'>
            <Input value={value.brand} onChange={onBrandChange} placeholder='请输入商标' />
          </Form.Item>
          <Form.Item label='规格'>
            <Input value={value.size} onChange={onSizeChange} placeholder='请输入规格' />
          </Form.Item>
          <Form.Item label='单价'>
            <PriceInput value={value.price || undefined} onChange={onPriceChange} />
          </Form.Item>
          <Form.Item label='材质'>
            <Input value={value.texture} onChange={onMaterialChange} placeholder='请输入材质' />
          </Form.Item>
          <Form.Item label='备注'>
            <Input value={value.remark} onChange={onRemarkChange} placeholder='请输入备注' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
