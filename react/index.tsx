import { canUseDOM } from 'vtex.render-runtime'
import type { PixelMessage } from './typings/events'

declare const window: any

export function handleEvents(e: PixelMessage) {

  const zinreloTrack = async () => {
    // console.log(e.data)
    if (e.data.eventName === 'vtex:userData') {
      const userData: any = e.data

      const s = document.createElement("script")
      s.type = "text/javascript"
      s.async = true
      s.id = "zinreloscript"
      s.src = "https://cdn.zinrelo.com/js/all.js"

      s.onload = async function () {
        const zrlsession = JSON.parse(window.sessionStorage.getItem("_zrlsession"))
        const partnerId = zrlsession.zrlKey
        const apiKey = zrlsession.zrlValue

        const uID = userData !== null && userData.isAuthenticated ? userData.id : ""
        const clientEmail = userData !== null && userData.isAuthenticated ? userData.email : ""
        const clientNameFull = userData !== null && userData.isAuthenticated ? userData.firstName + '' +userData.lastName : ""
        const currentTime = Date.now()

        const fullString = uID + clientEmail + partnerId + apiKey + currentTime
        const msgBuffer = new TextEncoder().encode(fullString)
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")

        window._zrl = window._zrl || []

        const init_data = {
          partner_id: partnerId,
          email: clientEmail,
          name: clientNameFull,
          user_id: uID,
          ts: currentTime,
          access_token: hashHex,
        }

        window._zrl.push(["init", init_data])
      }

      var x = window.document.getElementsByTagName("script")[0]
      x.parentNode.insertBefore(s, x)
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

  zinreloTrack()
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
