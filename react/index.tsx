import { canUseDOM } from 'vtex.render-runtime'
// import OrderEvent from './OrderEvent'

import type { PixelMessage } from './typings/events'

declare const window: any

export function handleEvents(e: PixelMessage) {

  const locationApiKey = 'af165da0138c14d05573b27e077b3e262489645fa0953803e73c3c41'

  // const getIp = async ()  => {
  //   return await fetch('https://www.cloudflare.com/cdn-cgi/trace').then(res => res.text())
  // }

  const getSum = (total: number, num: number) => {
    return total + num
  }

  const spressTrack = async () => {
    if (e.data.eventName === 'vtex:userData') {
      // Set UserId, Postal and IpAddress
      const uiD = e.data.isAuthenticated ? e.data.id : ''
      sessionStorage.setItem("spressoUID", uiD || '')
      // const IpAddress = await getIp()
      // const ip = IpAddress.split("ip=")[1].split("\n")[0]
      const getLocation = await fetch(`https://api.ipdata.co?api-key=${locationApiKey}`)
      const locationDetails = await getLocation.json()
      sessionStorage.setItem("spressoIP", locationDetails.ip || '')
      sessionStorage.setItem("spressoPostal", locationDetails.postal || '')
    }

    if (e.data.eventName === 'vtex:userData') {
      const uiD = sessionStorage.getItem("spressoUID")
      const ip = sessionStorage.getItem("spressoIP")
      const postal = sessionStorage.getItem("spressoPostal")

      if(window.SpressoSdk) {
        // Page View
        window.SpressoSdk.trackPageView({
          userId: uiD === '' ? null : uiD,
          remoteAddress: ip,
          postalCode: postal
        })
      }
    }

    if (e.data.eventName === 'vtex:productView') {
      const uiD = sessionStorage.getItem("spressoUID")
      const ip = sessionStorage.getItem("spressoIP")
      const postal = sessionStorage.getItem("spressoPostal")
      const data: any = e.data
      const product = data.product
      const sku = product.selectedSku

      if(window.SpressoSdk) {
        // View PDP
        window.SpressoSdk.trackViewPDP({
          userId: uiD === '' ? null : uiD,
          variantSku: sku.itemId,
          variantName: sku.name,
          variantPrice: sku.sellers[0].commertialOffer.Price,
          inStock: sku.sellers[0].commertialOffer.AvailableQuantity > 0,
          productId: product.productId,
          remoteAddress: ip,
          postalCode: postal
        })
      }
    }

    if (e.data.eventName === 'vtex:addToCart') {
      const uiD = sessionStorage.getItem("spressoUID")
      const ip = sessionStorage.getItem("spressoIP")
      const postal = sessionStorage.getItem("spressoPostal")
      const data: any = e.data
      const sku = data.items[0]

      if(window.SpressoSdk) {
        // Tap AddToCart
        window.SpressoSdk.trackTapAddToCart({
          userId: uiD === '' ? null : uiD,
          variantSku: sku.skuId,
          variantName: sku.variant,
          variantPrice: sku.price/100,
          productId: sku.productId,
          remoteAddress: ip,
          postalCode: postal
        })
      }
    }

    if (e.data.eventName === 'vtex:orderPlaced') {
      // OrderEvent()
      const uiD = sessionStorage.getItem("spressoUID")
      const data: any = e.data
      const items = data.transactionProducts
      const filterQty = items.map((qty: any) => qty["quantity"])
      // const filterCost = items.map((qty: any) => qty["price"])
      // const filterPrice = items.map((qty: any) => qty["sellingPrice"])
      const taxes: any = Object.values(data.transactionCustomTaxes)
      const totalQuantity = filterQty.reduce(getSum, 0)
      // const totalCost = filterCost.reduce(getSum, 0)
      // const totalPrice = filterPrice.reduce(getSum, 0)
      const totalTax = taxes.reduce(getSum, 0)

      if(window.SpressoSdk) {
        // Create Order
        window.SpressoSdk.trackCreateOrder({
          userId: uiD === '' ? null : uiD,
          orderNumber: data.ordersInOrderGroup[0],
          totalOrderPrice: data.transactionTotal,
          shippingInfoAddressLine1: data.visitorAddressStreet,
          shippingInfoAddressLine2: data.visitorAddresssComplement,
          shippingInfoCity: data.visitorAddressCity,
          shippingInfoState: data.visitorAddressState,
          shippingInfoPostalCode: data.visitorAddressPostalCode,
          shippingInfoCountry: data.visitorAddressCountry,
          shippingInfoFirstName: data.visitorContactInfo[1],
          shippingInfoLastName: data.visitorContactInfo[2],
          totalVariantQuantity: totalQuantity,
          // totalVariantCost: parseFloat(totalCost.toFixed(2)),
          totalVariantPrice: data.transactionSubtotal,
          orderTax: parseFloat(totalTax.toFixed(2)),
          totalOrderFees: data.transactionShipping,
          totalOrderDeductions: data.transactionDiscounts
        })

        // Purchase Variant
        items.forEach((item: any) => {
          window.SpressoSdk.trackPurchaseVariant({
            userId: uiD === '' ? null : uiD,
            orderNumber: data.ordersInOrderGroup[0],
            variantSku: item.sku,
            variantName: item.skuName,
            variantPrice: item.sellingPrice,
            variantQuantity: item.quantity,
            variantStandardPrice: item.originalPrice,
          })
        })
      }
    }
  }

  spressTrack()
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
