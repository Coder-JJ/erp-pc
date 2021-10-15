import styles from './index.less'
import React, { useMemo, useCallback, useState } from 'react'
import { Select, Divider, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useCustomers } from '../../hooks'
import { AddForm } from '../../views/Customer/FormModal'
import { Customer } from '../../rematch/models/customer'

const { Option } = Select

type SelectValue = number | number[]

interface Props<T> extends SelectProps<T> {
  addButtonVisible?: boolean
  onAdd? (id: number): void
}

const CustomerSelect = function <T extends SelectValue = SelectValue> ({ addButtonVisible, onAdd, ...props }: React.PropsWithChildren<Props<T>>): React.ReactElement {
  const [open, setOpen] = useState(false)
  const onFocus = useCallback(() => setOpen(true), [])
  const onBlur = useCallback(() => setOpen(false), [])
  const onInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // console.log(e.keyCode)
  }, [])
  const [customers] = useCustomers()
  const dropdownRender = useMemo<{} | { dropdownRender: Props<T>['dropdownRender'] }>(() => {
    if (addButtonVisible) {
      return {
        dropdownRender: menu => (
          <div className={styles.dropdown}>
            { menu }
            <Divider className={styles.divider} />
            <div className={styles.add}>
              <AddForm onSave={onAdd}>
                <Button type='link' block icon={<PlusOutlined />}>新增</Button>
              </AddForm>
            </div>
          </div>
        )
      }
    }
    return {}
  }, [addButtonVisible, onAdd])

  const itemFilter: Props<T>['filterOption'] = useCallback((keyword: string, option) => {
    const trimedKeyword = keyword.trim()
    const { name, leader } = (option.data as Customer)
    return name?.toLowerCase()?.includes(trimedKeyword.toLowerCase()) || leader?.toLowerCase()?.includes(trimedKeyword.toLowerCase())
  }, [])

  return (
    <Select<T>
      open={open}
      onFocus={onFocus}
      onBlur={onBlur}
      onInputKeyDown={onInputKeyDown}
      placeholder='请选择'
      {...dropdownRender}
      showSearch
      filterOption={itemFilter}
      dropdownMatchSelectWidth={false}
      {...props}
      optionLabelProp='name'
    >
      {
        customers.map(customer => (
          <Option key={customer.id} value={customer.id} data={customer} name={customer.name}>
            <span>{ customer.name }</span>
            {
              !!customer.leader?.trim() && (
                <>
                  <Divider type='vertical' />
                  <span>{ customer.leader }</span>
                </>
              )
            }
          </Option>
        ))
      }
    </Select>
  )
}

export default React.memo(CustomerSelect) as typeof CustomerSelect
