export default (ms: number): Promise<NodeJS.Timeout> => new Promise<NodeJS.Timeout>(resolve => setTimeout(resolve, ms))
