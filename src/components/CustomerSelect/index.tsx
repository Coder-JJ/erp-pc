import React from 'react'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useCustomers } from '../../hooks'

const { Option } = Select

const CustomerSelect: React.FC<SelectProps<number>> = function (props) {
  const [customers] = useCustomers()

  return (
    <Select<number> placeholder='请选择' {...props}>
      {
        customers.map(customer => <Option key={customer.id} value={customer.id}>{ customer.name }</Option>)
      }
    </Select>
  )
}

export default React.memo(CustomerSelect)
