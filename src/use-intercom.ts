import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { client } from './client'
import type { Simplify, IntercomClient, IntercomLoaderSettings } from './types'

type IntercomActions = Simplify<
  Omit<IntercomClient, 'init' | 'boot'> & {
    boot: () => void
  }
>

export type IntercomProps = IntercomLoaderSettings & {
  auto_boot?: boolean
}

let intercomClient = client as unknown as IntercomActions

const getSnapshot = () => intercomClient

const makeSubscribe = (props: IntercomProps) => (_: () => void) => {
  const autoBoot = 'auto_boot' in props ? props['auto_boot'] : true
  intercomClient = { ...client, boot: () => client.boot(props) }
  ;(intercomClient as unknown as IntercomClient).init(props)
  if (autoBoot) intercomClient.boot()
  return () => {
    intercomClient.shutdown()
    if (autoBoot) intercomClient.destroy()
  }
}

export const useIntercom = ({
  app_id,
  region,
  api_base,
  ...rest
}: IntercomProps) => {
  const props = useRef(rest)
  const mounted = useRef(false)
  const subscribe = useMemo(
    () =>
      makeSubscribe({
        app_id,
        region,
        api_base,
        ...props.current
      }),
    [app_id, region, api_base]
  )
  const client = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    client.update(rest)
  }, [rest])
  return client
}
