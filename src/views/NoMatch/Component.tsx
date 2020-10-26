import styles from './index.less'
import React from 'react'
import { Result } from 'antd'

const Component: React.FC = function () {
  return (
    <div className={styles.wrap}>
      <Result status='404' title='404' subTitle='抱歉，您访问的页面不存在。' />
    </div>
  )
}

export default React.memo(Component)
