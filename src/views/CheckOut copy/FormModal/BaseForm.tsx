import styles from './index.less'
import React, { useState, useCallback, useMemo } from 'react'
import { Modal, message, Form, Input, Table, InputNumber, Button } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { GetRowKey } from 'antd/lib/table/interface'
import dayjs, { Dayjs } from 'dayjs'
import { StockDetail } from '../../../rematch/models/stock'
import { AddForm as CheckOut, GoodsForm } from '../../../rematch/models/checkOut'
import { getCheckOutPrice, getGoodsPrice } from '../../../utils'
import { DatePicker, RepositorySelect, RepositoryGoodsSelect, PriceInput, CustomerSelect } from '../../../components'

interface Props {
  title: string
  value: CheckOut
  saving: boolean
  onChange (key: keyof CheckOut, value: any): void
  onGoodsPropChange (index: number, key: keyof GoodsForm, value: any): void
  onAddGoods (): void
  onDeleteGoods (index: number): void
  onSave (form: CheckOut): Promise<void>
  children: React.ReactElement
}

const BaseForm: React.FC<Props> = function (props) {
  const { title, value, saving, onChange, onGoodsPropChange: passedOnGoodsPropChange, onAddGoods, onDeleteGoods, onSave, children } = props
  const paidPlaceholder = useMemo(() => {
    if (typeof value.paid === 'number') {
      return { placeholder: `${value.paid}` }
    }
    const total = getCheckOutPrice(value)
    if (total) {
      return { placeholder: `${total.toFixed(2)}` }
    }
    return {}
  }, [value])

  const [visible, setVisible] = useState(false)
  const openModal = useCallback(() => setVisible(true), [])
  const closeModal = useCallback(() => !saving && setVisible(false), [saving])

  const addGoods = useCallback(() => onAddGoods(), [onAddGoods])
  const onDealTimeChange = useCallback((value: Dayjs | null, dateString: string) => onChange('dealTime', value!.valueOf()), [onChange])
  const onOddChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('odd', e.target.value), [onChange])
  const onRepositoryChange = useCallback((value: number) => {
    onChange('warehouseId', value)
    onChange('fetchGoodsRecordList', [])
    addGoods()
  }, [onChange, addGoods])
  const onCustomerChange = useCallback((value: number) => onChange('customId', value), [onChange])
  const onReceiverIdChange = useCallback((value: number) => onChange('receiverId', value), [onChange])
  const onReceiverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('receiver', e.target.value), [onChange])
  const onReceiverPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('receiverPhone', e.target.value), [onChange])
  const onReceivedAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('receivedAddress', e.target.value), [onChange])
  const onReceivedTimeChange = useCallback((value: Dayjs | null, dateString: string) => onChange('dealTime', value ? value.valueOf() : null), [onChange])
  const onGoodsPropChange = useCallback((index: number, key: keyof GoodsForm, value: any) => passedOnGoodsPropChange(index, key, value), [passedOnGoodsPropChange])
  const onSelectGoods = useCallback((index: number, value: number | undefined, goods: StockDetail[]) => {
    onGoodsPropChange(index, 'goodsId', value)
    const selectedGoods = goods.find(({ goodId }) => goodId === value)
    if (selectedGoods && typeof selectedGoods.goodPrice === 'number') {
      onGoodsPropChange(index, 'price', selectedGoods.goodPrice)
    }
  }, [onGoodsPropChange])
  const deleteGoods = useCallback((index: number) => onDeleteGoods(index), [onDeleteGoods])
  const onSignerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('signer', e.target.value), [onChange])
  // const onDiscountChange = useCallback((value: string | number | undefined) => onChange('discount', value), [onChange])
  const onPaidChange = useCallback((value: string | number | undefined) => onChange('paid', value), [onChange])
  const onRemarkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('remark', e.target.value), [onChange])
  const onOtherCostNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('otherCostName', e.target.value), [onChange])
  const onOtherCostChange = useCallback((value: string | number | undefined) => onChange('otherCost', value), [onChange])

  const onOk = useCallback(async () => {
    const form: CheckOut = {
      ...value,
      odd: value.odd.trim(),
      signer: value.signer.trim(),
      remark: value?.remark?.trim() || '',
      otherCostName: value?.otherCostName?.trim() || '',
      fetchGoodsRecordList: value.fetchGoodsRecordList.filter(({ goodsId, num }) => goodsId !== undefined && num).map(({ price, discount, paid, ...rest }) => ({ ...rest, price: price || 0, discount: discount || 1, paid: typeof paid === 'number' ? paid : null })),
      discount: value.discount || 1,
      paid: typeof value.paid === 'number' ? value.paid : null,
      otherCost: typeof value.otherCost === 'number' ? value.otherCost : null
    }
    if (!form.odd) {
      message.error('请输入单号')
      return
    }
    if (!form.dealTime) {
      message.error('请选择开单时间')
      return
    }
    if (!form.warehouseId) {
      message.error('请选择出库仓库')
      return
    }
    if (!form.fetchGoodsRecordList.length) {
      message.error('请正确填写出库货物')
      return
    }
    await onSave(form)
    closeModal()
  }, [value, onSave, closeModal])

  const goodsTableRowKey: GetRowKey<GoodsForm> = useCallback((record, index) => String(index), [])
  const goodsColumns: ColumnsType<GoodsForm> = useMemo(() => [
    {
      dataIndex: 'goodsId',
      title: '货物',
      render (goodsId, record, index) {
        return <RepositoryGoodsSelect repositoryId={value.warehouseId!} value={goodsId} onChange={(value, goods) => onSelectGoods(index, value, goods)} allowClear />
      }
    },
    {
      dataIndex: 'num',
      title: '数量',
      width: 110,
      render (num, record, index) {
        return <InputNumber value={num} onChange={value => onGoodsPropChange(index, 'num', value)} precision={0} min={0} />
      }
    },
    {
      dataIndex: 'price',
      title: '单价',
      width: 110,
      render (price, record, index) {
        return <PriceInput value={price} onChange={value => onGoodsPropChange(index, 'price', value)} />
      }
    },
    // {
    //   dataIndex: 'discount',
    //   title: '折扣',
    //   render (discount, record, index) {
    //     return <DiscountInput value={discount} onChange={value => onGoodsPropChange(index, 'discount', value)} />
    //   }
    // },
    {
      dataIndex: 'paid',
      title: '实付金额',
      width: 150,
      render (value, record, index) {
        const price = getGoodsPrice(record)
        const placeholder = typeof value === 'number' ? { placeholder: `${value}` } : (price ? { placeholder: `${price.toFixed(2)}` } : {})
        return <PriceInput className={placeholder.placeholder ? styles.paid : undefined} value={value} onChange={value => onGoodsPropChange(index, 'paid', value)} {...placeholder} />
      }
    },
    {
      dataIndex: 'operation',
      title: <Button type='primary' onClick={addGoods} disabled={typeof value.warehouseId !== 'number'} size='small'>新增</Button>,
      width: 70,
      render (value, record, index) {
        return <Button type='primary' onClick={() => deleteGoods(index)} danger size='small'>删除</Button>
      }
    }
  ], [onSelectGoods, onGoodsPropChange, value.warehouseId, addGoods, deleteGoods])

  return (
    <>
      { React.cloneElement(children, { onClick: openModal }) }
      <Modal wrapClassName={styles.wrap} visible={visible} onOk={onOk} onCancel={closeModal} width={1000} title={title} confirmLoading={saving}>
        <Form>
          <div className={styles.spaceBetween}>
            <Form.Item className={styles.item} label='开单时间' required>
              <DatePicker value={dayjs(value.dealTime)} onChange={onDealTimeChange} allowClear={false} placeholder='请选择开单时间' />
            </Form.Item>
            <Form.Item className={styles.item} label='出库仓库' required>
              <RepositorySelect value={value.warehouseId} onChange={onRepositoryChange} onAdd={onRepositoryChange} addButtonVisible />
            </Form.Item>
            <Form.Item className={styles.item} label='单号' required>
              <Input value={value.odd} onChange={onOddChange} placeholder='请输入单号' />
            </Form.Item>
          </div>
          <div className={styles.spaceBetween}>
            <Form.Item className={styles.item} label='客户/商标'>
              <CustomerSelect value={value.customId || undefined} onChange={onCustomerChange} onAdd={onCustomerChange} addButtonVisible allowClear />
            </Form.Item>
            <Form.Item className={styles.item} label='收货方/厂家'>
              <CustomerSelect value={value.receiverId || undefined} onChange={onReceiverIdChange} onAdd={onReceiverIdChange} addButtonVisible allowClear />
            </Form.Item>
            <Form.Item className={styles.item} label='收货时间'>
              <DatePicker value={value.receivedTime === null ? null : dayjs(value.receivedTime)} onChange={onReceivedTimeChange} placeholder='请选择收货时间' />
            </Form.Item>
          </div>
          <div className={styles.spaceBetween}>
            <Form.Item className={styles.item} label='收货联系人'>
              <Input value={value.receiver} onChange={onReceiverChange} placeholder='请输入收货联系人' />
            </Form.Item>
            <Form.Item className={styles.item} label='收货联系号码'>
              <Input value={value.receiverPhone} onChange={onReceiverPhoneChange} placeholder='请输入收货联系号码' />
            </Form.Item>
            <Form.Item className={styles.item} label='收货地址'>
              <Input value={value.receivedAddress} onChange={onReceivedAddressChange} placeholder='请输入收货地址' />
            </Form.Item>
          </div>
          <Form.Item>
            <Table<GoodsForm> rowKey={goodsTableRowKey} columns={goodsColumns} dataSource={value.fetchGoodsRecordList} bordered pagination={false} size='middle' />
          </Form.Item>
          <div className={styles.spaceBetween}>
            <div className={styles.flex}>
              <Form.Item label='其他费用'>
                <PriceInput value={value.otherCost === null ? undefined : value.otherCost} onChange={onOtherCostChange} placeholder='请输入费用金额' />
              </Form.Item>
              <Form.Item label='费用说明'>
                <Input value={value.otherCostName} onChange={onOtherCostNameChange} placeholder='请输入费用说明' />
              </Form.Item>
            </div>
            <div className={styles.flex}>
              { /* <Form.Item label='折扣'>
                <DiscountInput value={value.discount} onChange={onDiscountChange} />
              </Form.Item> */ }
              <Form.Item className={styles.item} label='实付金额'>
                <PriceInput className={paidPlaceholder.placeholder ? styles.paid : undefined} value={value.paid === null ? undefined : value.paid} onChange={onPaidChange} {...paidPlaceholder} />
              </Form.Item>
            </div>
          </div>
          <div className={styles.spaceBetween}>
            <Form.Item label='备注' className={styles.item}>
              <Input value={value.remark} onChange={onRemarkChange} placeholder='请输入备注' />
            </Form.Item>
            <Form.Item className={styles.item} label='签收人'>
              <Input value={value.signer} onChange={onSignerChange} placeholder='请输入签收人' />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
