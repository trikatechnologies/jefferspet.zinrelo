import React, { FC } from 'react'
import { Route } from 'vtex.my-account-commons/Router'

const MyAccountZinreloPage: FC = ({ children }) => {
  return <Route exact path="/jeffers-rewards" render={() => <>{children}</>} />
}

export default MyAccountZinreloPage
