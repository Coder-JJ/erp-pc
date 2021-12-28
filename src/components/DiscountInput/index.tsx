import styles from './index.less'
import React, { useCallback } from 'react'
import { InputNumber } from 'antd'
import { InputNumberProps } from 'antd/lib/input-number'

const DiscountInput: React.FC<InputNumberProps> = function(props) {
  const { onChange } = props
  const onBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => !e.target.value.trim() && onChange && onChange(1), [onChange])
  return <InputNumber className={styles.wrap} onBlur={onBlur} step={0.05} precision={2} max={1} min={0.01} placeholder='请输入折扣' {...props} />
}

export default React.memo(DiscountInput)
