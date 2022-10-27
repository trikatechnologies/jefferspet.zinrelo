import { canUseDOM } from 'vtex.render-runtime'

import type { PixelMessage } from './typings/events'

declare const window: any

export function handleEvents(e: PixelMessage) {
  const getIp = async ()  => {
    return await fetch('https://www.cloudflare.com/cdn-cgi/trace').then(res => res.text());
  }

  const getSum = (total: number, num: number) => {
    return total + num
  }

  const spressTrack = async () => {
    if (e.data.eventName === 'vtex:userData') {
      // Set UserId and IpAddress
      const uiD = e.data.isAuthenticated ? e.data.id : ''
      sessionStorage.setItem("spressoUID", uiD || '')
      const IpAddress = await getIp()
      const ip = IpAddress.split("ip=")[1].split("\n")[0]
      sessionStorage.setItem("spressoIP", ip || '')
    }

    if (e.data.eventName === 'vtex:userData') {
      const uiD = sessionStorage.getItem("spressoUID")
      const ip = sessionStorage.getItem("spressoIP")

      if(window.SpressoSdk) {
        // Page View
        window.SpressoSdk.trackPageView({
          userId: uiD === '' ? null : uiD,
          remoteAddress: ip
        })
      }
    }

    if (e.data.eventName === 'vtex:productView') {
      const uiD = sessionStorage.getItem("spressoUID")
      const ip = sessionStorage.getItem("spressoIP")
      const data: any = e.data
      const sku = data.product.selectedSku

      if(window.SpressoSdk) {
        // View PDP
        window.SpressoSdk.trackViewPDP({
          userId: uiD === '' ? null : uiD,
          variantSku: sku.itemId,
          variantName: sku.name,
          variantPrice: sku.sellers[0].commertialOffer.Price,
          variantCost: sku.sellers[0].commertialOffer.ListPrice,
          inStock: sku.sellers[0].commertialOffer.AvailableQuantity,
          remoteAddress: ip
        })
      }
    }

    if (e.data.eventName === 'vtex:addToCart') {
      const uiD = sessionStorage.getItem("spressoUID")
      const ip = sessionStorage.getItem("spressoIP")
      const data: any = e.data
      const sku = data.items[0]

      if(window.SpressoSdk) {
        // Tap AddToCart
        window.SpressoSdk.trackTapAddToCart({
          userId: uiD === '' ? null : uiD,
          variantSku: sku.skuId,
          variantName: sku.name,
          variantPrice: sku.sellingPrice,
          variantCost: sku.price,
          remoteAddress: ip
        })
      }
    }

    if (e.data.eventName === 'vtex:orderPlaced') {
      const uiD = sessionStorage.getItem("spressoUID")
      const data: any = e.data
      const items = data.transactionProducts
      const filterQty = items.map((qty: any) => qty["quantity"])
      const filterCost = items.map((qty: any) => qty["price"])
      const filterPrice = items.map((qty: any) => qty["sellingPrice"])
      const taxes: any = Object.values(data.transactionCustomTaxes)
      const totalQuantity = filterQty.reduce(getSum, 0)
      const totalCost = filterCost.reduce(getSum, 0)
      const totalPrice = filterPrice.reduce(getSum, 0)
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
          totalVariantCost: parseFloat(totalCost.toFixed(2)),
          totalVariantPrice: parseFloat(totalPrice.toFixed(2)),
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
            variantName: item.name,
            variantPrice: item.sellingPrice,
            variantQuantity: item.quantity,
            variantStandardPrice: item.originalPrice,
            variantCost: item.price
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
