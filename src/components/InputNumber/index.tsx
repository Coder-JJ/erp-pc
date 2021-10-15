import React, { useCallback } from 'react'
import { Input } from 'antd'
import { InputProps } from 'antd/lib/input'

export interface Props extends Omit<InputProps, 'onChange' | 'onBlur'> {
  positive?: boolean
  onChange? (value: string): void
  onBlur? (value: string): void
}

export const intReg = /^-?\d*(\.\d*)?$/
export const positiveIntReg = /^\d*(\.\d*)?$/

const InputNumber: React.FC<Props> = function ({ positive, onChange, onBlur, ...props }) {
  const onChangeHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const reg = positive ? positiveIntReg : intReg
    if ((!isNaN(Number(value)) && reg.test(value)) || value === '' || value === '-') {
      onChange && onChange(value)
    }
  }, [positive, onChange])
  const onBlurHandler = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target
    let valueTemp = value
    if (value.endsWith('.') || value === '-') {
      valueTemp = value.slice(0, -1)
    }
    valueTemp = valueTemp.replace(/0*(\d+)/, '$1')
    onChange && onChange(valueTemp)
    onBlur && onBlur(valueTemp)
  }, [onChange, onBlur])
  return <Input onChange={onChangeHandler} onBlur={onBlurHandler} {...props} />
}

export default React.memo(InputNumber)
