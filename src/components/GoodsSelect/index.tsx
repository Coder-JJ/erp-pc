import styles from './index.less'
import React, { useMemo, useCallback } from 'react'
import { Select, Button, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useGoods } from '../../hooks'
import { AddForm } from '../../views/Goods/FormModal'
import { Goods } from '../../rematch/models/goods'

const { Option } = Select

type SelectValue = number | number[]

interface Props<T> extends Omit<SelectProps<T>, 'onChange'> {
  addButtonVisible?: boolean
  onChange? (value: T | undefined, goods: Goods[]): void
  onAdd? (id: number, goods: Goods[]): void
}

const GoodsSelect = function <T extends SelectValue = SelectValue> ({ addButtonVisible, onChange, onAdd, ...props }: React.PropsWithChildren<Props<T>>): React.ReactElement {
  const [goods] = useGoods()
  const onGoodsChange = useCallback((value: T) => onChange && onChange(value, goods), [onChange, goods])
  const onAddGoods = useCallback((goods: Goods) => onAdd && onAdd(goods.id, [goods]), [onAdd])
  const dropdownRender = useMemo<{} | { dropdownRender: Props<T>['dropdownRender'] }>(() => {
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

  const itemFilter: Props<T>['filterOption'] = useCallback((keyword: string, option) => {
    const trimedKeyword = keyword.trim()
    const { name, brand, texture, size } = (option.data as Goods)
    return name.toLowerCase().includes(trimedKeyword.toLowerCase()) || brand.toLowerCase().includes(trimedKeyword.toLowerCase()) || texture?.includes(trimedKeyword) || size?.includes(trimedKeyword)
  }, [])

  return (
    <Select<T>
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
        goods.map(goods => {
          let name: string | React.ReactElement = goods.name
          if (goods.size?.trim()) {
            name = (
              <div>
                <span>{ goods.name }</span>
                <Divider type='vertical' />
                <span>{ goods.size }</span>
              </div>
            )
          }

          return (
            <Option key={goods.id} value={goods.id} data={goods} name={name}>
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
          )
        })
      }
    </Select>
  )
}

export default React.memo(GoodsSelect) as typeof GoodsSelect
