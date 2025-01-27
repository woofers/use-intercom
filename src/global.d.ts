import type { IntercomSettings } from './types'

declare global {
  interface Window {
    intercomSettings?: IntercomSettings
    Intercom: Function | undefined
    attachEvent: Function
  }
}

export {}
