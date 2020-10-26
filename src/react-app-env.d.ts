// / <reference types="react-scripts" />

declare module '*.less'

declare module '*.module.less' {
  const styles: { [key: string]: string }
  export default styles
}
