export type VisibilityEvent<T> = {
    key: string
    item: T
    index: number
    isVisible: boolean
    timestamp: number
  }