import styles from './index.less'
import React from 'react'
import { InputNumber } from 'antd'
import { InputNumberProps } from 'antd/lib/input-number'

const PriceInput: React.FC<InputNumberProps> = function (props) {
  return <InputNumber className={styles.wrap} precision={2} min={0} placeholder='请输入金额' {...props} />
}

export default React.memo(PriceInput)
