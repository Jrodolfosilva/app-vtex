import {
  ClientsConfig,
  LRUCache,
  Service,
  ServiceContext,
  RecorderState,
  EventContext,
} from '@vtex/api'

import { Clients } from './clients'
import { allStates } from './middlewares/allStates'
import { someStates } from './middlewares/someStates'

const TIMEOUT_MS = 800

//criar cache de memoria
const memoryCache = new LRUCache<string, any>({ max: 5000 })
metrics.trackCache('status', memoryCache)

//clientes disponivel no contexto
const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    
    status: {
      memoryCache,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, State>

  interface StatusChangeContext extends EventContext<Clients> {
    body: {
      domain: string
      orderId: string
      currentState: string
      lastState: string
      currentChangeDate: string
      lastChangeDate: string
    }
  }
  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {}
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  events: {
    allStates,
    someStates,
  },
})
