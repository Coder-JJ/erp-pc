import styles from './index.less'
import React, { useCallback } from 'react'
import { useControllableValue, usePersistFn } from 'ahooks'
import { Modal, message, Form } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import dayjs, { Dayjs } from 'dayjs'
import { AddForm as Collection } from '../../../rematch/models/collection'
import { DatePicker, PriceInput, CustomerSelect } from '../../../components'

interface Props extends Omit<ModalProps, 'children'> {
  value?: Collection
  saving: boolean
  onChange (key: keyof Collection, value: any): void
  onSave (form: Collection): Promise<void>
  children?: React.ReactElement
}

const BaseForm: React.FC<Props> = function(props) {
  const { value, saving, onChange, onSave, children, ...modalProps } = props

  const [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: 'visible',
    trigger: 'onCancel'
  })
  const openModal = useCallback(() => setVisible(true), [setVisible])
  const closeModal = useCallback(() => {
    !saving && setVisible(false)
  }, [saving, setVisible])

  const onCustomerChange = useCallback((value: number) => onChange('customId', value), [onChange])
  const onMoneyChange = useCallback((value: string | number | undefined) => onChange('collection', value), [onChange])
  const onMoneyDateChange = useCallback((value: Dayjs | null) => onChange('goodsTime', value!.valueOf()), [onChange])
  const onCollectionTimeChange = useCallback((value: Dayjs | null) => onChange('collectionTime', value!.valueOf()), [onChange])

  const onOk = usePersistFn(async() => {
    if (!value) {
      return
    }
    if (typeof value.customId !== 'number') {
      return message.error('请选择客户/商标')
    }
    if (typeof value.collection !== 'number') {
      return message.error('请填写货款金额')
    }
    if (value.goodsTime === null) {
      return message.error('请填写货款年月')
    }
    if (value.collectionTime === null) {
      return message.error('请填写打款时间')
    }
    await onSave(value)
    closeModal()
  })

  return (
    <>
      { !!children && React.cloneElement(children, { onClick: openModal }) }
      <Modal wrapClassName={styles.wrap} visible={visible} onOk={onOk} onCancel={closeModal} confirmLoading={saving} {...modalProps}>
        <Form>
          <Form.Item className={styles.item} label='客户/商标' required>
            <CustomerSelect value={value?.customId} onChange={onCustomerChange} onAdd={onCustomerChange} addButtonVisible />
          </Form.Item>
          <Form.Item className={styles.item} label='货款金额' required>
            <PriceInput value={value?.collection} onChange={onMoneyChange} />
          </Form.Item>
          <Form.Item className={styles.item} label='货款年月' required>
            <DatePicker picker='month' value={value?.goodsTime ? dayjs(value.goodsTime) : null} onChange={onMoneyDateChange} allowClear={false} />
          </Form.Item>
          <Form.Item className={styles.item} label='打款时间' required>
            <DatePicker value={value?.collectionTime ? dayjs(value.collectionTime) : null} onChange={onCollectionTimeChange} allowClear={false} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
