import styles from './index.less'
import React, { useMemo, useCallback } from 'react'
import { Select, Divider, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useCustomers } from '../../hooks'
import { AddForm } from '../../views/Customer/FormModal'
import { Customer } from '../../rematch/models/customer'

const { Option } = Select

type SelectValue = number | number[]

interface Props<T> extends Omit<SelectProps<T>, 'onChange'> {
  addButtonVisible?: boolean
  onChange? (value: T | undefined, customers: Customer[]): void
  onAdd? (id: number, customers: Customer[]): void
}

const CustomerSelect = function <T extends SelectValue = SelectValue>({ addButtonVisible, onChange, onAdd, ...props }: React.PropsWithChildren<Props<T>>): React.ReactElement {
  const customers = useCustomers()
  const onCustomersChange = useCallback((value: T) => onChange && onChange(value, customers), [onChange, customers])
  const onAddCustomer = useCallback((customer: Customer) => onAdd && onAdd(customer.id, [customer]), [onAdd])
  const dropdownRender = useMemo<{} | { dropdownRender: Props<T>['dropdownRender'] }>(() => {
    if (addButtonVisible) {
      return {
        dropdownRender: menu => (
          <div className={styles.dropdown}>
            { menu }
            <Divider className={styles.divider} />
            <div className={styles.add}>
              <AddForm onSave={onAddCustomer}>
                <Button type='link' block icon={<PlusOutlined />}>新增</Button>
              </AddForm>
            </div>
          </div>
        )
      }
    }
    return {}
  }, [addButtonVisible, onAddCustomer])

  const itemFilter: Props<T>['filterOption'] = useCallback((keyword: string, option) => {
    const trimedKeyword = keyword.trim().toLowerCase()
    const { name, leader } = (option.data as Customer)
    return name?.toLowerCase().includes(trimedKeyword) || leader?.toLowerCase().includes(trimedKeyword) || false
  }, [])

  return (
    <Select<T>
      placeholder='请选择'
      {...dropdownRender}
      showSearch
      filterOption={itemFilter}
      dropdownMatchSelectWidth={false}
      {...props}
      optionLabelProp='name'
      onChange={onCustomersChange}
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
