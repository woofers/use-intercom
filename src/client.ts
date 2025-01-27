import type {
  IntercomLoaderSettings,
  IntercomClient,
  IntercomEvent
} from './types'

const isDocumentReady = () =>
  document.readyState === 'complete' || document.readyState === 'interactive'

type Queue = {
  (): void
  q: unknown[]
  loaderQueue: (args: unknown) => void
}

const makeQueue = () => {
  const queueHolder: Queue = function () {
    queueHolder.loaderQueue(arguments)
  }
  queueHolder.q = []
  queueHolder.loaderQueue = function (args) {
    queueHolder.q.push(args)
  }
  return queueHolder
}

const events = [
  'boot',
  'shutdown',
  'update',
  'hide',
  'show',
  'showSpace',
  'showMessages',
  'showNewMessage',
  'onHide',
  'onShow',
  'onUnreadCountChange',
  'trackEvent',
  'getVisitorId',
  'startTour',
  'showArticle',
  'showNews',
  'startSurvey',
  'startChecklist',
  'showTicket',
  'showConversation'
] as const

const scriptElementId = '_intercom_npm_loader'
const addWidgetToPage = () => {
  const d = document
  if (d.getElementById(scriptElementId)) {
    return
  }
  const s = document.createElement('script')
  s.type = 'text/javascript'
  s.async = true
  s.id = scriptElementId
  s.src = 'https://widget.intercom.io/widget/' + window.intercomSettings?.app_id
  const x = d.getElementsByTagName('script')[0]
  x.parentNode?.insertBefore(s, x)
}

const init = ({ region, ...props }: IntercomLoaderSettings) => {
  if (typeof window === 'undefined') {
    return
  }
  const w = window
  const ic = w.Intercom
  const domainRegion = ['eu', 'au'].includes(region) ? `.${region}.` : '.'
  const config = {
    ...props,
    api_base: `https://api-iam${domainRegion}intercom.io`
  }
  w.intercomSettings = config
  if (typeof ic === 'function') {
    ic('reattach_activator')
    ic('update', config)
  } else {
    w.Intercom = makeQueue()
    if (isDocumentReady()) {
      addWidgetToPage()
    } else {
      document.addEventListener('readystatechange', function () {
        if (isDocumentReady()) {
          addWidgetToPage()
        }
      })
      if (w.attachEvent) {
        w.attachEvent('onload', addWidgetToPage)
      } else {
        w.addEventListener('load', addWidgetToPage, false)
      }
    }
  }
}

const destroy = () => {
  if (typeof document === 'undefined') {
    return
  }
  const script = document.getElementById(scriptElementId)
  const parent = script?.parentElement
  if (parent) {
    parent.removeChild(script)
    delete window.intercomSettings
    delete window.Intercom
  }
}

const invokeMethod = <T extends IntercomEvent>(
  method: T,
  ...args: Parameters<IntercomClient[T]>
) => {
  if (typeof window === 'undefined') {
    return
  } else if (!window.Intercom) {
    console.warn(`Intercom method '${method}' was called prior to loading`)
    return
  }
  window.Intercom(method, ...args)
}

const bindIntercom =
  <T extends IntercomEvent>(key: T) =>
  (...args: Parameters<IntercomClient[T]>) =>
    invokeMethod(key, ...args)

const createIntercom = () => {
  const client = { init, destroy } as unknown as IntercomClient
  events.forEach(event => {
    client[event] = bindIntercom(event)
  })
  return client
}

export const client = createIntercom()

export type { IntercomClient }
