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

declare global {
  interface Window {
    intercomSettings?: IntercomSettings
    Intercom: Function | undefined
    attachEvent: Function
  }
}

type Regions = 'us' | 'eu' | 'au'

type CompanyId =
  | {
      id: string
    }
  | { company_id: string }

type Company = CompanyId & {
  name: string
  created_at?: string
  remote_created_at?: string
  plan?: string
  monthly_spend?: number
  user_count?: number
  size?: number
  website?: string
  industry?: string
}

type Avatar = {
  type: string
  image_url: string
}

type IntercomSettings = MinimumBootArgs & {
  phone?: string
  unsubscribed_from_emails?: boolean
  language_override?: string
  utm_campaign?: string
  utm_content?: string
  utm_medium?: string
  utm_source?: string
  utm_term?: string
  avatar?: Avatar
  user_hash?: string
  company?: Company
  companies?: Company[]
  page_title?: string
  custom_launcher_selector?: string
  alignment?: string
  vertical_padding?: number
  horizontal_padding?: number
  hide_default_launcher?: boolean
  session_duration?: number
  action_color?: string
  background_color?: string
  installation_type?: string
}

export type IntercomLoaderSettings = IntercomSettings & {
  region?: Regions
} 

type MinimumBootArgs = UserArgs & {
  app_id: string
  api_base?: string
}

type UserArgs = {
  email?: string
  created_at?: number
  name?: string
  user_id?: string
}

type OnCallback = (callback: Function) => void

export type IntercomClient = {
  init: (props: IntercomLoaderSettings) => void
  boot: (arg: IntercomSettings) => void
  shutdown: () => void
  update: (arg: UserArgs) => void
  hide: () => void
  show: () => void
  showSpace: (spaceName: string) => void
  showMessages: () => void
  showNewMessage: (prePopulatedContent: string) => void
  onHide: OnCallback
  onShow: OnCallback
  onUnreadCountChange: OnCallback
  trackEvent: (...args: any) => void
  getVisitorId: () => void
  startTour: (tourId: string) => void
  showArticle: (articleId: string) => void
  showNews: (newsItemId: string) => void
  startSurvey: (surveyId: string) => void
  startChecklist: (checklistId: string) => void
  showTicket: (ticketId: string) => void
  showConversation: (conversationId: string) => void
}

type IntercomEvent = keyof IntercomClient

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
  const client = { init } as IntercomClient
  events.forEach(event => {
    client[event] = bindIntercom(event)
  })
  return client
}

export const client = createIntercom()
