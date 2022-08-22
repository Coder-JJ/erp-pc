import styles from './index.less'
import React, { useCallback, useEffect, useRef } from 'react'
import { useControllableValue, usePersistFn, useSetState } from 'ahooks'
import { Modal, message, Form, DatePicker, Input, Select } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import moment from 'moment'
import { AddForm as Collection, PaymentPlatform, paymentPlatforms } from '../../../rematch/models/collection'
import { PriceInput, CustomerSelect } from '../../../components'
import { useDispatch } from '../../../hooks'
import { FlatCustomerAccount, FullCustomerAccount } from '../../../rematch/models/customerAccount'

interface Props extends Omit<ModalProps, 'children'> {
  value?: Collection
  record?: Collection
  customerAccount?: FlatCustomerAccount
  saving: boolean
  onOpen?(): void
  onChange (key: keyof Collection, value: any): void
  onSave (form: Collection): Promise<void>
  children?: React.ReactElement
}

export interface State {
  customerAccount: FullCustomerAccount | null
}

const BaseForm: React.FC<Props> = function(props) {
  const { value, record, customerAccount, saving, onOpen, onChange, onSave, children, ...modalProps } = props

  const [state, setState] = useSetState<State>({
    customerAccount: null
  })

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
  const onMoneyDateChange = useCallback((value: moment.Moment | null) => onChange('goodsTime', value!.valueOf()), [onChange])
  const onCollectionTimeChange = useCallback((value: moment.Moment | null) => onChange('collectionTime', value!.valueOf()), [onChange])
  const onPayerChange = usePersistFn<React.ChangeEventHandler<HTMLInputElement>>(e => onChange('payer', e.target.value))
  const onPaymentPlatformChange = usePersistFn((value: string) => onChange('paymentPlatform', value))
  const onRemarkChange = usePersistFn<React.ChangeEventHandler<HTMLInputElement>>(e => onChange('remark', e.target.value))

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

  const dispatch = useDispatch()
  useEffect(() => {
    if (visible) {
      onOpen?.()
    }
  }, [visible, onOpen])

  const valueCollection = useRef<number>()
  valueCollection.current = value?.collection
  const recordRef = useRef(record)
  recordRef.current = record
  const lockCustomerAccountRef = useRef<boolean>()
  lockCustomerAccountRef.current = !!customerAccount
  useEffect(() => {
    if (!lockCustomerAccountRef.current && visible && typeof value?.customId === 'number' && typeof value?.goodsTime === 'number') {
      dispatch.customerAccount.loadCustomerAccount({
        customerId: value.customId,
        billMonth: moment(value.goodsTime).format('YYYY-MM')
      }).then(customerAccount => {
        if (customerAccount && recordRef.current && customerAccount.billMonth === moment(recordRef.current.goodsTime).format('YYYY-MM')) {
          // eslint-disable-next-line
          customerAccount.paidAmount -= recordRef.current?.collection || 0
        }
        setState({ customerAccount })
        if (!customerAccount) {
          return onChange('collection', undefined)
        }
        const restAmount = customerAccount.billAmount - customerAccount.paidAmount - customerAccount.refundAmount
        onChange('collection', restAmount)
        // if (typeof valueCollection.current !== 'number' || valueCollection.current > restAmount) {
        //   onChange('collection', restAmount)
        // }
      })
    }
  }, [visible, value?.customId, value?.goodsTime, dispatch.customerAccount, setState, onChange])

  const restAmount = customerAccount ? (customerAccount.billAmount - customerAccount.paidAmount - customerAccount.refundAmount) : (state.customerAccount ? (state.customerAccount.billAmount - state.customerAccount.paidAmount - state.customerAccount.refundAmount) : 0)
  const noRestAmount = customerAccount ? !restAmount : (!state.customerAccount || state.customerAccount.customerId !== value?.customId || !restAmount)

  return (
    <>
      { !!children && React.cloneElement(children, { onClick: openModal }) }
      <Modal wrapClassName={styles.wrap} {...modalProps} visible={visible} onOk={onOk} onCancel={closeModal} okButtonProps={{ disabled: noRestAmount }} confirmLoading={saving}>
        <Form>
          <Form.Item className={styles.item} label='客户/商标' required>
            <CustomerSelect value={value?.customId} onChange={onCustomerChange} onAdd={onCustomerChange} addButtonVisible disabled={lockCustomerAccountRef.current} />
          </Form.Item>
          <Form.Item className={styles.item} label='货款年月' required>
            <DatePicker picker='month' value={value?.goodsTime ? moment(value.goodsTime) : null} onChange={onMoneyDateChange} allowClear={false} disabled={lockCustomerAccountRef.current} />
          </Form.Item>
          <Form.Item className={styles.item} label='货款金额' required>
            <PriceInput value={value?.collection} onChange={onMoneyChange} max={customerAccount ? restAmount : (value?.customId && value.customId === state.customerAccount?.customerId ? restAmount : undefined)} disabled={noRestAmount} />
          </Form.Item>
          <Form.Item className={styles.item} label='打款时间' required>
            <DatePicker value={value?.collectionTime ? moment(value.collectionTime) : null} onChange={onCollectionTimeChange} allowClear={false} />
          </Form.Item>
          <Form.Item className={styles.item} label='打款人/账号'>
            <Input value={value?.payer || undefined} onChange={onPayerChange} placeholder='请输入打款人/账号' />
          </Form.Item>
          <Form.Item className={styles.item} label='打款平台'>
            <Select<PaymentPlatform> value={value?.paymentPlatform || undefined} onChange={onPaymentPlatformChange} allowClear placeholder='请选择打款平台'>
              {
                paymentPlatforms.map(p => <Select.Option key={p.value} value={p.value}>{ p.label }</Select.Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item className={styles.item} label='备注'>
            <Input value={value?.remark || undefined} onChange={onRemarkChange} placeholder='请输入备注' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
