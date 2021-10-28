import './index.less'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import dayjs from 'dayjs'
import qs from 'qs'
import { loadBill, PrintRouteParams } from '../../rematch/models/bill'
import { CheckOut } from '../../rematch/models/checkOut'
import BillPreview from '../../components/BillPreview'

const PrintBill: React.FC = function () {
  const location = useLocation()
  const params = useMemo(() => location.search.slice(1), [location.search])
  const paramsObj = useMemo<PrintRouteParams>(() => qs.parse(params) as any, [params])

  const [data, setData] = useState<CheckOut[]>([])
  useEffect(() => {
    window.parent.postMessage(false)
    if (params) {
      loadBill(params).then(data => {
        setData(data)
        window.parent.postMessage(true)
      })
    }
  }, [params])

  return <BillPreview checkOuts={data} startDate={dayjs(paramsObj.startTime)} endDate={dayjs(paramsObj.endTime)} />
}

export default React.memo(PrintBill)
