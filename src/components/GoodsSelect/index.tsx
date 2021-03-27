import styles from './index.less'
import React, { useMemo, useCallback } from 'react'
import { Select, Button, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useGoods } from '../../hooks'
import { AddForm } from '../../views/Goods/FormModal'
import { Goods } from '../../rematch/models/goods'

const { Option } = Select

interface Props extends Omit<SelectProps<number>, 'onChange'> {
  addButtonVisible?: boolean
  onChange? (value: number | undefined, goods: Goods[]): void
  onAdd? (id: number, goods: Goods[]): void
}

const GoodsSelect: React.FC<Props> = function ({ addButtonVisible, onChange, onAdd, ...props }) {
  const [goods] = useGoods()
  const onGoodsChange = useCallback((value: number) => onChange && onChange(value, goods), [onChange, goods])
  const onAddGoods = useCallback((goods: Goods) => onAdd && onAdd(goods.id, [goods]), [onAdd])
  const dropdownRender = useMemo<{} | { dropdownRender: Props['dropdownRender'] }>(() => {
    if (addButtonVisible) {
      return {
        dropdownRender: menu => (
          <div className={styles.dropdown}>
            { menu }
            <Divider className={styles.divider} />
            <div className={styles.add}>
              <AddForm onSave={onAddGoods}>
                <Button type='link' block icon={<PlusOutlined />}>新增货物</Button>
              </AddForm>
            </div>
          </div>
        )
      }
    }
    return {}
  }, [addButtonVisible, onAddGoods])

  const itemFilter: Props['filterOption'] = useCallback((keyword, option) => {
    const trimedKeyword = keyword.trim()
    const { name, brand, texture, size } = (option.data as Goods)
    return name?.includes(trimedKeyword) || brand?.includes(trimedKeyword) || texture?.includes(trimedKeyword) || size?.includes(trimedKeyword)
  }, [])

  return (
    <Select<number>
      placeholder='请选择货物'
      {...dropdownRender}
      showSearch
      filterOption={itemFilter}
      dropdownMatchSelectWidth={false}
      {...props}
      optionLabelProp='name'
      onChange={onGoodsChange}
    >
      {
        goods.map(goods => (
          <Option key={goods.id} value={goods.id} data={goods} name={goods.name}>
            {
              !!goods.brand?.trim() && (
                <>
                  <span>{ goods.brand }</span>
                  <Divider type='vertical' />
                </>
              )
            }
            <span>{ goods.name }</span>
            {
              !!goods.size?.trim() && (
                <>
                  <Divider type='vertical' />
                  <span>{ goods.size }</span>
                </>
              )
            }
            {
              !!goods.texture?.trim() && (
                <>
                  <Divider type='vertical' />
                  <span>{ goods.texture }</span>
                </>
              )
            }
          </Option>
        ))
      }
    </Select>
  )
}

export default React.memo(GoodsSelect)
