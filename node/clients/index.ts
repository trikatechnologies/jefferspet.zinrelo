import { IOClients } from '@vtex/api'

import ZinreloAPI from './zinreloAPI'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get ZinreloAPI() {
    return this.getOrSet('zinreloAPI', ZinreloAPI)
  }
}
