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

const getSnapshop = () => client as unknown as IntercomActions

const makeSubscribe = (props: IntercomProps) => (_: () => void) => {
  const autoBoot = 'auto_boot' in props ? props['auto_boot'] : true
  client.init(props)
  if (autoBoot) client.boot(props)
  return () => {
    client.shutdown()
    if (autoBoot) client.destroy()
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
  const client = useSyncExternalStore(subscribe, getSnapshop, getSnapshop)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    client.update(rest)
  }, [rest])
  return client
}
