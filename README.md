# use-intercom

TypeScript & React Intercom SDK

## Installation

**pnpm**

```pnpm
pnpm add use-intercom
```

**Yarn**

```yarn
yarn add use-intercom
```

**npm**

```npm
npm install use-intercom
```

## Usage

```tsx
import { useIntercom } from 'use-intercom'

const App = () => {
  const client = useIntercom({
    region: 'us',
    app_id: 123
  })
  return /* */
}
```

Or with auto-boot disabled.  This means you will need to call `client.boot()` to
show the Intercom widget and optionally `client.destory()` to remove the script tag.

```tsx
import { useEffect } from 'react'
import { useIntercom } from 'use-intercom'

const App = () => {
  const client = useIntercom({
    region: 'us',
    app_id: 123,
    auto_boot: false
  })
  return <button type="button" onClick={client.boot}>Start Intercom</button>
}
```

Or for use without React (Vue, Svelte, Astro and plain HTML/TypeScript)

```tsx
import { client } from 'use-intercom'

const settings = {
    region: 'us',
    app_id: '123'
}

// Startup
client.init(settings) // Add script tag
client.boot(settings) // Show Intercom

// Shutdown
client.shutdown() // Hide Intercom
client.destroy() // Remove script tag
```