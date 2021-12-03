import styles from './index.less'
import React, { useCallback, useMemo } from 'react'
import { useControllableValue } from 'ahooks'
import { Modal, message, Form, Input, Table, InputNumber, Button } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { ColumnsType } from 'antd/lib/table'
import { GetRowKey } from 'antd/lib/table/interface'
import dayjs, { Dayjs } from 'dayjs'
import { useCustomers, useGoods } from '../../../hooks'
import { Goods } from '../../../rematch/models/goods'
import { Customer } from '../../../rematch/models/customer'
import { AddForm as ReturnGoods, GoodsForm } from '../../../rematch/models/returnGoods'
import { getReturnGoodsPriceDisplay, getGoodsPriceDisplay } from '../../../utils'
import { DatePicker, PriceInput, CustomerSelect, GoodsSelect } from '../../../components'

interface Props extends Omit<ModalProps, 'children'> {
  value?: ReturnGoods
  saving: boolean
  onChange (key: keyof ReturnGoods, value: any): void
  onGoodsPropChange (index: number, key: keyof GoodsForm, value: any): void
  onAddGoods (): void
  onResetGoodsProps (index: number): void
  onSave (form: ReturnGoods): Promise<void>
  children?: React.ReactElement
}

const BaseForm: React.FC<Props> = function (props) {
  const { value, saving, onChange, onGoodsPropChange: passedOnGoodsPropChange, onAddGoods, onResetGoodsProps, onSave, children, ...modalProps } = props
  const customers = useCustomers()

  const [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: 'visible',
    trigger: 'onCancel'
  })
  const openModal = useCallback(() => setVisible(true), [setVisible])
  const closeModal = useCallback(() => {
    !saving && setVisible(false)
  }, [saving, setVisible])

  const onReturnTimeChange = useCallback((value: Dayjs | null, dateString: string) => {
    onChange('cancelTime', value!.valueOf())
  }, [onChange])
  const onCustomerChange = useCallback((value: number) => onChange('customId', value), [onChange])
  const onReturnSideChange = useCallback((receiverId: number, customers: Customer[]) => {
    onChange('cancelPersonId', receiverId)
  }, [onChange])
  const copyCustomerId = useCallback(() => typeof value?.customId === 'number' && onReturnSideChange(value.customId, customers), [onReturnSideChange, customers, value?.customId])
  const copyReturnSideId = useCallback(() => typeof value?.cancelPersonId === 'number' && onCustomerChange(value.cancelPersonId), [onCustomerChange, value?.cancelPersonId])
  const onGoodsPropChange = useCallback((index: number, key: keyof GoodsForm, value: any) => passedOnGoodsPropChange(index, key, value), [passedOnGoodsPropChange])
  const onSelectGoods = useCallback((index: number, record: GoodsForm, value: number | undefined, goods: Goods[]) => {
    onGoodsPropChange(index, 'goodsId', value)
    const item = goods.find(({ id }) => id === value)
    if (!item) {
      return
    }
    const { price, ifNeedReticule, ifNeedShoeCover, containerSize } = item
    if (typeof price === 'number') {
      onGoodsPropChange(index, 'price', price)
    }
    if (!record.num) {
      return
    }
    if (ifNeedReticule && record.reticule === 0) {
      onGoodsPropChange(index, 'reticule', record.num)
    }
    if (ifNeedShoeCover && record.shoeCover === 0) {
      onGoodsPropChange(index, 'shoeCover', record.num)
    }
    if (typeof containerSize === 'number' && containerSize > 0 && record.container === 0) {
      onGoodsPropChange(index, 'container', Math.ceil((record.num || 0) / containerSize))
    }
  }, [onGoodsPropChange])
  const [goods] = useGoods()
  const onGoodsNumChange = useCallback((index: number, record: GoodsForm, value: any) => {
    const currentNum = record.num
    onGoodsPropChange(index, 'num', value)
    const item = goods.find(({ id }) => id === record.goodsId)
    if (!item) {
      return
    }
    const { ifNeedReticule, ifNeedShoeCover, containerSize } = item
    if (ifNeedReticule && record.reticule === currentNum) {
      onGoodsPropChange(index, 'reticule', value)
    }
    if (ifNeedShoeCover && record.shoeCover === currentNum) {
      onGoodsPropChange(index, 'shoeCover', value)
    }
    if (typeof containerSize === 'number' && containerSize > 0 && record.container === Math.ceil(currentNum / containerSize)) {
      onGoodsPropChange(index, 'container', Math.ceil((value || 0) / containerSize))
    }
  }, [goods, onGoodsPropChange])
  const resetGoodsProps = useCallback((index: number) => onResetGoodsProps(index), [onResetGoodsProps])
  const onRemarkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange('remark', e.target.value), [onChange])

  const onOk = useCallback(async () => {
    if (!value) {
      return
    }
    const form: ReturnGoods = {
      ...value,
      remark: value?.remark?.trim() || '',
      cancelGoodsRecordList: value.cancelGoodsRecordList.filter(({ goodsId }) => goodsId !== undefined).map(({ price, ...rest }) => ({ ...rest, price: price || 0 }))
    }
    if (!form.cancelTime) {
      message.error('请选择退货日期')
      return
    }
    if (typeof form.customId !== 'number') {
      message.error('请选择客户/商标')
      return
    }
    if (typeof form.cancelPersonId !== 'number') {
      message.error('请选退货方/厂家')
      return
    }
    if (!form.cancelGoodsRecordList.length) {
      message.error('请正确填写退货货物')
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
        return <GoodsSelect<number> value={goodsId} onChange={(value, goods) => onSelectGoods(index, record, value, goods)} onAdd={(id, goods) => onSelectGoods(index, record, id, goods)} allowClear addButtonVisible />
      }
    },
    {
      dataIndex: 'num',
      title: '数量',
      width: 100,
      render (num, record, index) {
        return <InputNumber value={num} onChange={value => onGoodsNumChange(index, record, value)} precision={0} min={0} />
      }
    },
    {
      dataIndex: 'reticule',
      title: '手提袋',
      width: 100,
      render (reticule, record, index) {
        return <InputNumber value={reticule} onChange={value => onGoodsPropChange(index, 'reticule', value)} precision={0} min={0} />
      }
    },
    {
      dataIndex: 'shoeCover',
      title: '鞋套',
      width: 100,
      render (shoeCover, record, index) {
        return <InputNumber value={shoeCover} onChange={value => onGoodsPropChange(index, 'shoeCover', value)} precision={0} min={0} />
      }
    },
    {
      dataIndex: 'container',
      title: '外箱',
      width: 100,
      render (container, record, index) {
        return <InputNumber value={container} onChange={value => onGoodsPropChange(index, 'container', value)} precision={0} min={0} />
      }
    },
    {
      dataIndex: 'price',
      title: '单价',
      width: 100,
      render (price, record, index) {
        return <PriceInput value={price} onChange={value => onGoodsPropChange(index, 'price', value)} />
      }
    },
    {
      dataIndex: 'paid',
      title: '退货金额',
      width: 135,
      render (value, record) {
        return getGoodsPriceDisplay(record)
      }
    },
    {
      dataIndex: 'operation',
      width: 70,
      render (value, record, index) {
        return <Button type='primary' onClick={() => resetGoodsProps(index)} size='small'>清空</Button>
      }
    }
  ], [onSelectGoods, onGoodsPropChange, onGoodsNumChange, resetGoodsProps])

  return (
    <>
      { !!children && React.cloneElement(children, { onClick: openModal }) }
      <Modal wrapClassName={styles.wrap} visible={visible} onOk={onOk} onCancel={closeModal} width={1000} confirmLoading={saving} {...modalProps}>
        <Form>
          <Form.Item className={styles.item} label='退货日期' required>
            <DatePicker value={value ? dayjs(value.cancelTime) : null} onChange={onReturnTimeChange} allowClear={false} placeholder='请选择开单日期' />
          </Form.Item>
          <div className={styles.spaceBetween}>
            <Form.Item className={styles.item} label='客户/商标' required>
              <CustomerSelect value={value?.customId} onChange={onCustomerChange} onAdd={onCustomerChange} addButtonVisible />
              <a onClick={copyReturnSideId}>同退货方/厂家</a>
            </Form.Item>
            <Form.Item className={styles.item} label='退货方/厂家' required>
              <CustomerSelect value={value?.cancelPersonId} onChange={onReturnSideChange} onAdd={onReturnSideChange} addButtonVisible />
              <a onClick={copyCustomerId}>同客户/商标</a>
            </Form.Item>
          </div>
          <Form.Item>
            <Table<GoodsForm> rowKey={goodsTableRowKey} columns={goodsColumns} dataSource={value?.cancelGoodsRecordList} bordered pagination={false} size='middle' />
          </Form.Item>
          <div className={styles.spaceBetween}>
            <div className={styles.flex}>
              <Form.Item label='备注' className={styles.item}>
                <Input value={value?.remark || ''} onChange={onRemarkChange} placeholder='请输入备注' />
              </Form.Item>
            </div>
            <div className={styles.flex}>
              <Form.Item className={styles.item} label='退货金额'>{ value && getReturnGoodsPriceDisplay(value) }</Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(BaseForm)
