import React, { useState, useCallback } from 'react'
import { Modal, message, Form, Input, InputNumber } from 'antd'
import { AddForm as Supplier } from '../../../rematch/models/supplier'
import { useEnterEvent } from '../../../hooks'

interface Props {
  title: string
  value: Supplier
  saving: boolean
  onChange (key: keyof Supplier, value: any): void
  onSave (form: Supplier): Promise<void>
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
  const onPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('phone', e.target.value), [onChange])
  const onFaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('fax', e.target.value), [onChange])
  const onAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('address', e.target.value), [onChange])
  const onAddressDetailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('addressDetail', e.target.value), [onChange])
  const onBankChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('bank', e.target.value), [onChange])
  const onBankAccountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('bankAccount', e.target.value), [onChange])
  const onBankAccountNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('bankAccountName', e.target.value), [onChange])
  const onMailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('mail', e.target.value), [onChange])
  const onWebsiteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('website', e.target.value), [onChange])
  const onRemarkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('remark', e.target.value), [onChange])
  const onSortChange = useCallback((value: string | number | undefined) => onChange('sort', value), [onChange])

  const onOk = useCallback(async () => {
    const form: Supplier = {
      ...value,
      name: value.name.trim(),
      leader: value.leader.trim(),
      leaderPhone: value.leaderPhone.trim(),
      phone: value.phone.trim(),
      fax: value.fax.trim(),
      address: value.address.trim(),
      addressDetail: value.addressDetail.trim(),
      bank: value.bank.trim(),
      bankAccount: value.bankAccount.trim(),
      bankAccountName: value.bankAccountName.trim(),
      mail: value.mail.trim(),
      website: value.website.trim(),
      remark: value.remark.trim(),
      sort: typeof value.sort === 'number' ? value.sort : 0
    }
    if (!form.name) {
      message.error('请输入供应商名称')
      return
    }
    await onSave(form)
    closeModal()
  }, [value, onSave, closeModal])

  useEnterEvent(onOk, visible)

  return (
    <>
      { React.cloneElement(children, { onClick: openModal }) }
      <Modal visible={visible} onOk={onOk} onCancel={closeModal} title={title} confirmLoading={saving} zIndex={2000}>
        <Form layout='vertical'>
          <Form.Item label='供应商名称' required>
            <Input value={value.name} onChange={onNameChange} placeholder='请输入供应商名称' />
          </Form.Item>
          <Form.Item label='负责人'>
            <Input value={value.leader} onChange={onLeaderChange} placeholder='请输入负责人姓名' />
          </Form.Item>
          <Form.Item label='负责人手机号码'>
            <Input value={value.leaderPhone} onChange={onLeaderPhoneChange} placeholder='请输入负责人手机号码' />
          </Form.Item>
          <Form.Item label='座机号'>
            <Input value={value.phone} onChange={onPhoneChange} placeholder='请输入座机号' />
          </Form.Item>
          <Form.Item label='传真号'>
            <Input value={value.fax} onChange={onFaxChange} placeholder='请输入传真号' />
          </Form.Item>
          <Form.Item label='地址（省市区）'>
            <Input value={value.address} onChange={onAddressChange} placeholder='请输入省市区' />
          </Form.Item>
          <Form.Item label='详细地址'>
            <Input value={value.addressDetail} onChange={onAddressDetailChange} placeholder='请输入详细地址' />
          </Form.Item>
          <Form.Item label='开户行'>
            <Input value={value.bank} onChange={onBankChange} placeholder='请输入开户行' />
          </Form.Item>
          <Form.Item label='银行账号'>
            <Input value={value.bankAccount} onChange={onBankAccountChange} placeholder='请输入银行账号' />
          </Form.Item>
          <Form.Item label='银行账户名'>
            <Input value={value.bankAccountName} onChange={onBankAccountNameChange} placeholder='请输入银行账户名' />
          </Form.Item>
          <Form.Item label='邮箱'>
            <Input value={value.mail} onChange={onMailChange} placeholder='请输入邮箱' />
          </Form.Item>
          <Form.Item label='官网'>
            <Input value={value.website} onChange={onWebsiteChange} placeholder='请输入官网网址' />
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
