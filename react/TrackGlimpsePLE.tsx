import React, { useCallback, useEffect, useState } from 'react'
import { useProductSummary } from 'vtex.product-summary-context/ProductSummaryContext'

declare const window: any

const TrackGlimpsePLE = () => {
  const { product } = useProductSummary()
  const [pleData, setPleData] = useState('')
  const [productPLEData, setProducPLEData] = useState('')

  const skuID = product.sku.itemId
  let trackPLEData = '', trackProductPLEData = ''

  const debounce = (fn: Function, ms = 700) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    }
  }

  const isInViewport = (element: HTMLElement) => {
    var bounding = element.getBoundingClientRect();

    return (bounding.top >= 0 && bounding.left >= 0 && bounding.right <= (window.innerWidth || document.documentElement.clientWidth) && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight))
  }

  const setTrackGlimpseEvent = () => {
    const elem = document.getElementsByClassName(`trackPLE`) as HTMLCollection
    if(elem && elem?.length > 0) {
      Array.from(elem).forEach((ele: any) => {

        if (isInViewport(ele) === false) return

        ele.classList.remove('trackPLE')
        const pledata = ele.getAttribute('data-trackPLEdata')
        const prodpledata = ele.getAttribute('data-trackProdPLEdata')

        if(window.SpressoSdk) {
          if(pledata !== '') {
            // GLIMPSE PLE
            window.SpressoSdk.trackGlimpsePLE(JSON.parse(pledata))
          }
          if(prodpledata !== '') {
            // GLIMPSE Product PLE
            window.SpressoSdk.trackGlimpseProductPLE(JSON.parse(prodpledata))
          }
          window.addEventListener('scroll', handleEvent)
        }
      })
    }
  }

  const handleEvent = useCallback(debounce(setTrackGlimpseEvent), [])

  useEffect(() => {
    if(!product) return

    if(window.SpressoSdk) {

      const uiD = sessionStorage.getItem("spressoUID")
      const ip = sessionStorage.getItem("spressoIP")
      const postal = sessionStorage.getItem("spressoPostal")

      const priceRange = product.priceRange
      const lowPrice = priceRange.sellingPrice.lowPrice
      const highPrice = priceRange.sellingPrice.highPrice

      const availableSkus = product.items.filter((sku: any) => sku.sellers[0].commertialOffer.AvailableQuantity > 0)

      if(product.items.length === 1) {
        // trackGlimpsePLE
        trackPLEData = JSON.stringify({
          userId: uiD === '' ? null : uiD,
          variantSku: product.sku.itemId,
          variantName: product.sku.name,
          variantPrice: product.sku.seller.commertialOffer.Price,
          productId: product.productId,
          remoteAddress: ip,
          postalCode: postal
        })

        setPleData(trackPLEData)
      }

      if(product.items.length > 1) {
        if(availableSkus.length > 1) {
          // trackGlimpseProductPLE
          trackProductPLEData = JSON.stringify({
            userId: uiD === '' ? null : uiD,
            productId: product.productId,
            productName: product.productName,
            minPriceRange: lowPrice,
            maxPriceRange: highPrice,
            remoteAddress: ip,
            postalCode: postal
          })

          setProducPLEData(trackProductPLEData)
        }
        if(availableSkus.length === 1) {
          // trackGlimpsePLE
          trackPLEData = JSON.stringify({
            userId: uiD === '' ? null : uiD,
            variantSku: product.sku.itemId,
            variantName: product.sku.name,
            variantPrice: product.sku.seller.commertialOffer.Price,
            productId: product.productId,
            remoteAddress: ip,
            postalCode: postal
          })

          setPleData(trackPLEData)
        }
      }
    }
  }, [product])

  useEffect(() => {
    if(trackPLEData === '' || trackProductPLEData === '') return

    if(window.SpressoSdk) {
      handleEvent()
    }
  }, [trackPLEData, trackProductPLEData])

  useEffect(() => {
    handleEvent()
  }, [])

  return (
    <><div className={`trackPLE trackPLE-${skuID}`} data-trackPLEdata={pleData} data-trackProdPLEdata={productPLEData}></div></>
  )
}

export default TrackGlimpsePLE
