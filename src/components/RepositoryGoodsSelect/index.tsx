import React from 'react'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useRepostitoryGoods } from '../../hooks'

const { Option } = Select
const RepostitoryGoodsSelect: React.FC<SelectProps<number>> = function (props) {
  const goods = useRepostitoryGoods()

  return (
    <Select<number> placeholder='请选择货物' {...props}>
      {
        goods.map(goods => <Option key={goods.id} value={goods.id} data={goods}>{ goods.name }</Option>)
      }
    </Select>
  )
}

export default React.memo(RepostitoryGoodsSelect)
