import React, { useEffect, useMemo, useState } from 'react'
import { usePersistFn } from 'ahooks'
import { Alert, Modal, Steps } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { StepProps } from 'antd/lib/steps'
import { DeleteOutlined, FormOutlined, RedEnvelopeOutlined, SendOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useDispatch } from '../../../hooks'
import { CheckOut, CheckOutState } from '../../../rematch/models/checkOut'

const status: CheckOutState[] = [
  CheckOutState.InStock,
  CheckOutState.Delivered,
  CheckOutState.Signed,
  CheckOutState.Paid,
  CheckOutState.Canceled
]

export interface Props extends ModalProps {
  checkOut?: CheckOut
}

const StatusModal: React.FC<Props> = function(props) {
  const { checkOut, ...modalProps } = props

  const [current, setCurrent] = useState<number | undefined>()
  useEffect(() => {
    setCurrent(status.findIndex(s => s === checkOut?.state) || 0)
  }, [checkOut])

  const footer = useMemo<ModalProps>(() => checkOut?.state === CheckOutState.Canceled ? { footer: null } : {}, [checkOut?.state])

  const dispatch = useDispatch()
  const [loading, setLoading] = useState<boolean>(false)
  const onOk = usePersistFn((e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!checkOut || current === undefined) {
      return props.onOk?.(e)
    }
    new Promise<void>(resolve => {
      if (current === 3) {
        return Modal.confirm({
          title: '是否确定已收款？',
          content: <Alert type='warning' message='标记收款后不计入账单待收金额！' />,
          onOk() {
            setLoading(true)
            dispatch.checkOut.setCheckOutState({ id: checkOut.id, state: status[current] }).then(resolve)
          }
        })
      } else if (current === 4) {
        return Modal.confirm({
          title: '是否确定作废？',
          content: <Alert type='warning' message='标记作废后不可撤销！' />,
          onOk() {
            setLoading(true)
            dispatch.checkOut.cancelCheckOut(checkOut).then(resolve)
          }
        })
      }
      setLoading(true)
      dispatch.checkOut.setCheckOutState({ id: checkOut.id, state: status[current] }).then(resolve)
    }).then(() => {
      props.onOk?.(e)
    }).catch(e => {
      console.error(e)
    }).finally(() => {
      setLoading(false)
    })
  })

  const stepStatus: StepProps['status'] = current === 4 ? 'wait' : undefined

  return (
    <Modal title={`${checkOut?.state === CheckOutState.Canceled ? '' : '编辑'}出库单状态`} width={700} {...footer} {...modalProps} onOk={onOk} confirmLoading={loading}>
      <Steps current={current} onChange={checkOut?.state === CheckOutState.Canceled ? undefined : setCurrent}>
        <Steps.Step title='备货中' icon={<ShoppingCartOutlined />} status={stepStatus} />
        <Steps.Step title='已发货' icon={<SendOutlined />} status={stepStatus} />
        <Steps.Step title='已签收' icon={<FormOutlined />} status={stepStatus} />
        <Steps.Step title='已收款' icon={<RedEnvelopeOutlined />} status={stepStatus} />
        <Steps.Step title='作废' icon={<DeleteOutlined />} status={current === 4 ? 'error' : undefined} />
      </Steps>
    </Modal>
  )
}

export default React.memo(StatusModal)
