import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient, Apps } from '@vtex/api'

import { PurchasePayload } from '../typings/zinrelo'

export default class ZinreloAPI extends ExternalClient {
  private setting: any | boolean = false
  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://api.zinrelo.com', context, {
      ...options,
    })
  }

  private async getHeaders() {
    const app = new Apps(this.context)

    this.setting = await app.getAppSettings(process.env.VTEX_APP_ID ?? '')

    return {
      headers: {
        'Content-type': 'application/json',
        'api-key': this.setting?.apiKey,
        'partner-id': this.setting?.partnerId,
      },
    }
  }

  public async purchase(payload: PurchasePayload): Promise<any> {
    var req = await this.http.post('/v1/loyalty/purchase', payload, await this.getHeaders())
    return req
  }
}
