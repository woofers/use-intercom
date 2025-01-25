import { useCallback, useMemo, useSyncExternalStore } from 'react'
import {
  client,
  type IntercomClient,
  type IntercomLoaderSettings
} from './client'
import type { Simplify } from './types'

type IntercomActions = Simplify<
  Omit<IntercomClient, 'init' | 'boot'> & {
    boot: () => void
  }
>

type IntercomProps = IntercomLoaderSettings & {
  auto_boot?: boolean
}

const getSnapshop = () => client as unknown as IntercomActions

const makeSubscribe = (props: IntercomProps) => (_: () => void) => {
  const autoBoot = 'auto_boot' in props ? props['auto_boot'] : true
  client.init(props)
  if (autoBoot) client.boot(props)
  return () => {
    client.shutdown()
  }
}

export const useIntercom = (props: IntercomProps) => {
  const subscribe = useMemo(() => makeSubscribe(props), [props])
  const client = useSyncExternalStore(subscribe, getSnapshop, getSnapshop)
  return client
}
