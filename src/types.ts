export type Simplify<T> = { [K in keyof T]: T[K] } & {}

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

export type IntercomSettings = MinimumBootArgs & {
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
  destroy: () => void
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
  trackEvent: (...args: unknown[]) => void
  getVisitorId: () => void
  startTour: (tourId: string) => void
  showArticle: (articleId: string) => void
  showNews: (newsItemId: string) => void
  startSurvey: (surveyId: string) => void
  startChecklist: (checklistId: string) => void
  showTicket: (ticketId: string) => void
  showConversation: (conversationId: string) => void
}

export type IntercomEvent = keyof IntercomClient
