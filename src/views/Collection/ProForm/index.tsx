import React, { useMemo, useRef } from 'react'
import { ModalForm, ModalFormProps, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Collection, EditForm, paymentPlatforms } from '../../../rematch/models/collection'
import { useCustomers, useDispatch } from '../../../hooks'
import ProFormDatePickerMonth from '@ant-design/pro-form/lib/components/DatePicker/MonthPicker'
import { usePersistFn, useSetState, useUpdateEffect } from 'ahooks'
import { Form, Typography } from 'antd'
import { FlatCustomerAccount } from '../../../rematch/models/customerAccount'
import moment, { isMoment } from 'moment'

export interface Props extends ModalFormProps<EditForm> {
  collection?: Collection
  customerAccount?: FlatCustomerAccount
  onSuccess?: () => void
}

export interface State {
  amountMax: Record<string, number | null | undefined>
}

const ProForm: React.FC<Props> = function(props) {
  const { collection, customerAccount, onSuccess, ...rest } = props

  const editMode = !!collection
  const registerMode = !editMode && !!customerAccount

  const [form] = Form.useForm<EditForm>()
  const customerId = Form.useWatch('customId', form)
  const belongTime = Form.useWatch('goodsTime', form)
  const billMonth = useMemo(() => {
    if (belongTime === undefined || belongTime === null) {
      return undefined
    }
    return isMoment(belongTime) ? belongTime.format('YYYY-MM') : moment(belongTime).format('YYYY-MM')
  }, [belongTime])

  const [state, setState] = useSetState<State>({
    amountMax: {}
  })
  const amountMax = useMemo(() => {
    if (customerId !== undefined && billMonth) {
      return state.amountMax[`${customerId}-${billMonth}`]
    }
    return undefined
  }, [customerId, billMonth, state.amountMax])

  const setAmountMax = usePersistFn((customerId: number, billMonth: string, amountMax: number | null) => {
    setState(prevState => ({
      amountMax: {
        ...prevState.amountMax,
        [`${customerId}-${billMonth}`]: amountMax
      }
    }))
  })

  const customers = useCustomers()
  const customerOptions = useMemo(() => customers.map(c => ({ value: c.id, label: c.name })), [customers])

  const dispatch = useDispatch()
  const onFinish = usePersistFn(async(formData: EditForm) => {
    if (editMode) {
      await dispatch.collection.editCollection(formData)
    } else {
      await dispatch.collection.addCollection(formData)
    }
    onSuccess?.()
    return true
  })

  const onVisibleChange = usePersistFn((visible: boolean) => {
    if (visible) {
      if (collection) {
        form.setFieldsValue(collection)
      } else if (customerAccount) {
        form.setFieldsValue({
          customId: customerAccount.id,
          goodsTime: moment(customerAccount.billMonth).valueOf(),
          collection: customerAccount.billAmount - customerAccount.paidAmount - customerAccount.refundAmount,
          collectionTime: moment().valueOf()
        })
        setAmountMax(customerAccount.id, customerAccount.billMonth, customerAccount.billAmount)
      } else {
        form.setFieldsValue({
          collectionTime: moment().valueOf()
        })
      }
    } else {
      form.resetFields()
      setState({
        amountMax: {}
      })
    }
  })

  const registerModeRef = useRef(registerMode)
  registerModeRef.current = registerMode
  useUpdateEffect(() => {
    if (!registerModeRef.current && customerId !== undefined && billMonth) {
      const params = { customerId, billMonth }
      dispatch.customerAccount.loadCustomerAccount(params).then(res => {
        setAmountMax(params.customerId, params.billMonth, res ? res.billAmount : null)
      })
    }
  }, [customerId, billMonth])

  return (
    <ModalForm<EditForm> {...rest} title={editMode ? '编辑' : '新增'} form={form} onFinish={onFinish} onVisibleChange={onVisibleChange} dateFormatter='number' width={500}>
      <ProFormText name='id' hidden />
      <ProFormSelect name='customId' label='客户/商标' options={customerOptions} showSearch fieldProps={{ optionFilterProp: 'label' }} disabled={editMode || registerMode} required rules={[{ required: true }]} />
      <ProFormDatePickerMonth name='goodsTime' label='货款年月' disabled={registerMode} required rules={[{ required: true }]} />
      <ProFormDigit
        name='collection'
        label='货款金额'
        help={(
          amountMax ? (
            <Typography.Text mark>{ billMonth } 账单金额：{ amountMax }￥</Typography.Text>
          ) : (
            amountMax === null ? <Typography.Text mark>{ billMonth } 没有账单</Typography.Text> : undefined
          )
        )}
        fieldProps={{ precision: 2 }}
        required
        rules={[{ required: true }]}
      />
      <ProFormDatePicker name='collectionTime' label='打款时间' required rules={[{ required: true }]} />
      <ProFormText name='payer' label='打款人/账号' />
      <ProFormSelect name='paymentPlatform' label='打款平台' options={paymentPlatforms} />
      <ProFormText name='remark' label='备注' />
    </ModalForm>
  )
}

export default React.memo(ProForm)
