export default (s: number): Promise<NodeJS.Timeout> => new Promise<NodeJS.Timeout>(resolve => setTimeout(resolve, s * 1000))
