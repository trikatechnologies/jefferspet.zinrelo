import React, { useEffect, useState } from 'react'
import { useProductSummary } from 'vtex.product-summary-context/ProductSummaryContext'

declare const window: any

const TrackGlimpsePLE = () => {
  const { product } = useProductSummary()
  const [pleData, setPleData] = useState('')

  const skuID = product.sku.itemId
  let trackdata

  const isInViewport = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  window.onscroll = () => {
    const elem = document.getElementsByClassName(`trackPLE`)
    Array.from(elem).forEach((ele: any) => {

      if (!isInViewport(ele)) return

      ele.classList.remove('trackPLE')
      const data = ele.getAttribute('data-trackdata')

      if(window.SpressoSdk) {
        // GLIMPSE PLE
        window.SpressoSdk.trackGlimpsePLE(JSON.parse(data))
      }

    })
  }

  useEffect(() => {
    if(!product) return

    if(window.SpressoSdk) {

      const uiD = sessionStorage.getItem("spressoUID")

      trackdata = JSON.stringify({
        userId: uiD === '' ? null : uiD,
        variantSku: product.sku.itemId,
        variantName: product.sku.name,
        variantPrice: product.sku.seller.commertialOffer.Price,
        variantCost: product.sku.seller.commertialOffer.ListPrice
      })

      setPleData(trackdata)
    }
  }, [product])

  return (
    <><div className={`trackPLE trackPLE-${skuID}`} data-trackdata={pleData}></div></>
  )
}

export default TrackGlimpsePLE
