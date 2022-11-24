import { json } from 'co-body'

import type { PurchasePayload } from '../typings/zinrelo'

export async function purchase(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { ZinreloAPI },
  } = ctx

  const body: PurchasePayload = await json(ctx.req)

  console.info(body)

  const data = await ZinreloAPI.purchase({
    user_email: body.user_email,
    total: body.total,
    subtotal: body.subtotal,
    order_id: body.order_id
  })

  ctx.body = data

  await next()
}
