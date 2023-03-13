import React, { useEffect } from 'react'
import { useQuery } from 'react-apollo'
import AppSettings from './graphql/appSettings.graphql'

declare const window: any

const zinreloDashboard = () => {
  const { data } = useQuery(AppSettings, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  });

  useEffect(() => {
    if (!data?.appSettings?.message) return
    window.zrl_mi && window.zrl_mi.attach_dashboard()
  }, [data])

  const css = `@media screen and (min-width: 320px){#zrl_embed_div{height:650px;width:100%;}}@media screen and (min-width: 768px){#zrl_embed_div{height:900px;width:100%;}}@media screen and (min-width: 992px){#zrl_embed_div{height:100vw;width:100%;}}`

  return (
    <>
      <div className={`pa5`}>
        <style>{css}</style>
        <div id='zrl_embed_div'></div>
      </div>
    </>
  )
}
export default zinreloDashboard
