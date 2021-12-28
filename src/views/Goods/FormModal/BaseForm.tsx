import styles from './index.less'
import React, { useState, useCallback, useEffect } from 'react'
import { Modal, message, Form, Input, Checkbox, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { AddForm as Goods, Whether } from '../../../rematch/models/goods'
import { PriceInput, InputNumber } from '../../../components'
import { positiveIntReg } from '../../../components/InputNumber'

interface Props {
  title: string
  value: Goods
  saving: boolean
  onChange (key: keyof Goods, value: any): void
  onSave (form: Goods): Promise<void>
  children: React.ReactElement
}

const BaseForm: React.FC<Props> = function(props) {
  const { title, value, saving, onChange, onSave, children } = props

  const [visible, setVisible] = useState(false)
  const openModal = useCallback(() => setVisible(true), [])
  const closeModal = useCallback(() => !saving && setVisible(false), [saving])

  const [needBox, setNeedBox] = useState(typeof value.containerSize === 'number')
  const [boxSize, setBoxSize] = useState<string>(typeof value.containerSize === 'number' ? String(value.containerSize) : '30')
  useEffect(() => {
    setNeedBox(typeof value.containerSize === 'number')
    setBoxSize(typeof value.containerSize === 'number' ? String(value.containerSize) : '30')
  }, [value.containerSize])

  const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('name', e.target.value)
    onChange('brand', e.target.value)
  }, [onChange])
  // const onMaterialChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('texture', e.target.value), [onChange])
  const onSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('size', e.target.value), [onChange])
  const onRemarkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('remark', e.target.value), [onChange])
  const onPriceChange = useCallback((value: string | number | undefined) => onChange('price', value), [onChange])
  const onIfNeedReticuleChange = useCallback((e: RadioChangeEvent) => onChange('ifNeedReticule', e.target.value), [onChange])
  const onIfNeedShoeCoverChange = useCallback((e: RadioChangeEvent) => onChange('ifNeedShoeCover', e.target.value), [onChange])
  const onNeedBoxChange = useCallback((e: CheckboxChangeEvent) => setNeedBox(e.target.checked), [])

  const onOk = useCallback(async() => {
    const form: Goods = {
      ...value,
      name: value.name.trim(),
      brand: value.brand.trim(),
      texture: value.texture.trim(),
      size: value.size.trim(),
      price: typeof value.price === 'number' ? value.price : null,
      containerSize: needBox ? (positiveIntReg.test(boxSize) ? (Number(boxSize) || null) : null) : null,
      remark: value.remark.trim()
    }
    if (!form.name) {
      message.error('请输入货物名称')
      return
    }
    await onSave(form)
    closeModal()
  }, [value, needBox, boxSize, onSave, closeModal])

  return (
    <>
      { React.cloneElement(children, { onClick: openModal }) }
      <Modal visible={visible} onOk={onOk} onCancel={closeModal} title={title} confirmLoading={saving} zIndex={2000}>
        <Form layout='vertical'>
          <Form.Item label='名称' required>
            <Input value={value.name} onChange={onNameChange} placeholder='请输入货物名称' />
          </Form.Item>
          <Form.Item label='规格'>
            <Input value={value.size} onChange={onSizeChange} placeholder='请输入规格' />
          </Form.Item>
          <Form.Item label='单价'>
            <PriceInput value={value.price || undefined} onChange={onPriceChange} />
          </Form.Item>
          <Form.Item label='手提袋'>
            <Radio.Group value={value.ifNeedReticule} onChange={onIfNeedReticuleChange} name='111'>
              <Radio value={Whether.Yes}>需要</Radio>
              <Radio value={Whether.Not}>不需要</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label='鞋套'>
            <Radio.Group value={value.ifNeedShoeCover} onChange={onIfNeedShoeCoverChange} name='222'>
              <Radio value={Whether.Yes}>需要</Radio>
              <Radio value={Whether.Not}>不需要</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label='外箱'>
            <div className={styles.flex}>
              <Checkbox checked={needBox} onChange={onNeedBoxChange}>需要</Checkbox>
              <InputNumber className={styles.input} value={boxSize} onChange={setBoxSize} positive disabled={!needBox} addonAfter='装/箱' />
            </div>
          </Form.Item>
          { /* <Form.Item label='材质'>
            <Input value={value.texture} onChange={onMaterialChange} placeholder='请输入材质' />
          </Form.Item> */ }
          <Form.Item label='备注'>
            <Input value={value.remark} onChange={onRemarkChange} placeholder='请输入备注' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
