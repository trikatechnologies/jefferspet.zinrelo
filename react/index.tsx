import { canUseDOM } from 'vtex.render-runtime'
// import OrderEvent from './OrderEvent'

import type { PixelMessage } from './typings/events'

declare const window: any

export function handleEvents(e: PixelMessage) {

  const spressTrack = async () => {
    console.log(e.data)
    if (e.data.eventName === 'vtex:userData') {
    }

    if (e.data.eventName === 'vtex:orderPlaced') {
      const data = e.data
      const payload = JSON.stringify({
        user_email: data.visitorContactInfo[0],
        total: ""+data.transactionTotal,
        subtotal: ""+data.transactionSubtotal,
        order_id: data?.orderGroup
      })
      var options = {
        method: "POST",
        body: payload
      }
      await fetch("/v0/purchase", options)
    }
  }

  spressTrack()
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
