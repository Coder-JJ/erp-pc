import 'antd/lib/date-picker/style/index'
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'
import generatePicker from 'antd/lib/date-picker/generatePicker'
import { Dayjs } from 'dayjs'

const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig)

export default DatePicker
