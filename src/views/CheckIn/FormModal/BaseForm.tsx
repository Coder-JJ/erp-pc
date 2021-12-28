import styles from './index.less'
import React, { useState, useCallback, useMemo } from 'react'
import { Modal, message, Form, Input, Table, InputNumber, Button } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { GetRowKey } from 'antd/lib/table/interface'
import dayjs, { Dayjs } from 'dayjs'
import { Goods } from '../../../rematch/models/goods'
import { AddForm as CheckIn, GoodsForm } from '../../../rematch/models/checkIn'
import { getCheckInPrice, getGoodsPrice } from '../../../utils'
import { DatePicker, RepositorySelect, GoodsSelect, DiscountInput, PriceInput, SupplierSelect } from '../../../components'

interface Props {
  title: string
  value: CheckIn
  saving: boolean
  onChange (key: keyof CheckIn, value: any): void
  onGoodsPropChange (index: number, key: keyof GoodsForm, value: any): void
  onAddGoods (): void
  onDeleteGoods (index: number): void
  onSave (form: CheckIn): Promise<void>
  children: React.ReactElement
}

const BaseForm: React.FC<Props> = function(props) {
  const { title, value, saving, onChange, onGoodsPropChange, onAddGoods, onDeleteGoods, onSave, children } = props
  const paidPlaceholder = useMemo(() => {
    if (typeof value.paid === 'number') {
      return { placeholder: `${value.paid}` }
    }
    const total = getCheckInPrice(value)
    if (total) {
      return { placeholder: `${total.toFixed(2)}` }
    }
    return {}
  }, [value])

  const [visible, setVisible] = useState(false)
  const openModal = useCallback(() => setVisible(true), [])
  const closeModal = useCallback(() => !saving && setVisible(false), [saving])

  const onReceiveTimeChange = useCallback((value: Dayjs | null, dateString: string) => onChange('receivedTime', value!.valueOf()), [onChange])
  const onOddChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('odd', e.target.value), [onChange])
  const onRepositoryChange = useCallback((value: number) => onChange('warehouseId', value), [onChange])
  const onSupplierChange = useCallback((value: number) => onChange('supplierId', value), [onChange])
  const onGoodsChange = useCallback((index: number, key: keyof GoodsForm, value: any) => onGoodsPropChange(index, key, value), [onGoodsPropChange])
  const onSelectGoods = useCallback((index: number, value: number | undefined, goods: Goods[]) => {
    onGoodsChange(index, 'goodsId', value)
    const selectedGoods = goods.find(({ id }) => id === value)
    if (selectedGoods && typeof selectedGoods.price === 'number') {
      onGoodsChange(index, 'price', selectedGoods.price)
    }
  }, [onGoodsChange])
  const addGoods = useCallback(() => onAddGoods(), [onAddGoods])
  const deleteGoods = useCallback((index: number) => onDeleteGoods(index), [onDeleteGoods])
  const onSignerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('signer', e.target.value), [onChange])
  const onDiscountChange = useCallback((value: string | number | undefined) => onChange('discount', value), [onChange])
  const onPaidChange = useCallback((value: string | number | undefined) => onChange('paid', value), [onChange])
  const onRemarkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('remark', e.target.value), [onChange])

  const onOk = useCallback(async() => {
    const form: CheckIn = {
      ...value,
      odd: value.odd.trim(),
      signer: value.signer.trim(),
      remark: value?.remark?.trim() || '',
      saveGoodsRecordList: value.saveGoodsRecordList.filter(({ goodsId, num }) => goodsId !== undefined && num).map(({ price, discount, paid, ...rest }) => ({ ...rest, price: price || 0, discount: discount || 1, paid: typeof paid === 'number' ? paid : null })),
      discount: value.discount || 1,
      paid: typeof value.paid === 'number' ? value.paid : null
    }
    if (!form.odd) {
      message.error('请输入单号')
      return
    }
    if (!form.receivedTime) {
      message.error('请选择签收时间')
      return
    }
    if (!form.warehouseId) {
      message.error('请选择入库仓库')
      return
    }
    if (!form.saveGoodsRecordList.length) {
      message.error('请正确填写入库货物')
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
      render(goodsId, record, index) {
        return <GoodsSelect value={goodsId} onChange={(value, goods) => onSelectGoods(index, value, goods)} onAdd={(id, goods) => onSelectGoods(index, id, goods)} allowClear addButtonVisible />
      }
    },
    {
      dataIndex: 'num',
      title: '数量',
      width: 160,
      render(num, record, index) {
        return <InputNumber value={num} onChange={value => onGoodsChange(index, 'num', value)} precision={0} min={0} />
      }
    },
    {
      dataIndex: 'price',
      title: '单价',
      width: 160,
      render(price, record, index) {
        return <PriceInput value={price} onChange={value => onGoodsChange(index, 'price', value)} />
      }
    },
    {
      dataIndex: 'discount',
      title: '折扣',
      width: 160,
      render(discount, record, index) {
        return <DiscountInput value={discount} onChange={value => onGoodsChange(index, 'discount', value)} />
      }
    },
    {
      dataIndex: 'paid',
      title: '应付金额',
      width: 160,
      render(value, record, index) {
        const price = getGoodsPrice(record)
        const placeholder = typeof value === 'number' ? { placeholder: `${value}` } : (price ? { placeholder: `${price.toFixed(2)}` } : {})
        return <PriceInput className={placeholder.placeholder ? styles.paid : undefined} value={value} onChange={value => onGoodsChange(index, 'paid', value)} {...placeholder} />
      }
    },
    {
      dataIndex: 'operation',
      title: <Button type='primary' onClick={addGoods} size='small'>新增</Button>,
      width: 70,
      render(value, record, index) {
        return <Button type='primary' onClick={() => deleteGoods(index)} danger size='small'>删除</Button>
      }
    }
  ], [onSelectGoods, onGoodsChange, addGoods, deleteGoods])

  return (
    <>
      { React.cloneElement(children, { onClick: openModal }) }
      <Modal wrapClassName={styles.wrap} visible={visible} onOk={onOk} onCancel={closeModal} width={1000} title={title} confirmLoading={saving}>
        <Form>
          <div className={styles.spaceBetween}>
            <Form.Item className={styles.item} label='签收时间' required>
              <DatePicker value={dayjs(value.receivedTime)} onChange={onReceiveTimeChange} allowClear={false} placeholder='请选择签收时间' />
            </Form.Item>
            <Form.Item className={styles.item} label='单号' required>
              <Input value={value.odd} onChange={onOddChange} placeholder='请输入单号' />
            </Form.Item>
          </div>
          <div className={styles.spaceBetween}>
            <Form.Item className={styles.item} label='入库仓库' required>
              <RepositorySelect value={value.warehouseId} onChange={onRepositoryChange} onAdd={onRepositoryChange} addButtonVisible />
            </Form.Item>
            <Form.Item className={styles.item} label='供应商'>
              <SupplierSelect value={value.supplierId || undefined} onChange={onSupplierChange} onAdd={onSupplierChange} addButtonVisible allowClear />
            </Form.Item>
          </div>
          <Form.Item>
            <Table<GoodsForm> rowKey={goodsTableRowKey} columns={goodsColumns} dataSource={value.saveGoodsRecordList} bordered pagination={false} size='middle' />
          </Form.Item>
          <div className={styles.spaceBetween}>
            <Form.Item className={styles.item} label='签收人'>
              <Input value={value.signer} onChange={onSignerChange} placeholder='请输入签收人' />
            </Form.Item>
            <div className={styles.flex}>
              <Form.Item label='折扣'>
                <DiscountInput value={value.discount} onChange={onDiscountChange} />
              </Form.Item>
              <Form.Item label='应付金额'>
                <PriceInput className={paidPlaceholder.placeholder ? styles.paid : undefined} value={value.paid === null ? undefined : value.paid} onChange={onPaidChange} {...paidPlaceholder} />
              </Form.Item>
            </div>
          </div>
          <Form.Item label='备注'>
            <Input value={value.remark} onChange={onRemarkChange} placeholder='请输入备注' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
