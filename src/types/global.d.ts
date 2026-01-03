export { }

declare global {
  type Result<T> = [T, null] | [null, Error]
}
