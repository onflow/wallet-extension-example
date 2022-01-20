import React, {useEffect, useState} from "react"
import {MemoryRouter, Switch, Route} from "react-router"
import FirstTime from "../pages/FirstTime"
import Balances from "../pages/Balances"
import CreateAccount from "../pages/CreateAccount"

function AuthnRouter() {
  const [loading, setLoading] = useState(true)
  const [initial, setInitial] = useState(null)
  useEffect(() => {
    setInitial("/Balances")
    /*     if (keyVault.unlocked) {
      const selectedAccount = await accountManager.getFavoriteAccount()
      if (selectedAccount) {
        setInitial("/Balances")
      } else {
        setInitial("/SelectAccount")
      }
    } else {
      // if we have an account, go to Login page
      const allAccounts = await accountManager.listAccounts()
      if (allAccounts.size > 0) {
        setInitial("/LogIn")
      } else {
        setInitial("/FirstTime")
      }
    } */
    setLoading(false)
  }, [])

  if (loading) {
    return null
  }
  const entryRoutes = ["/FirstTime", "/LogIn", "/Balances", "/SelectAccount"]
  const initialIndex = entryRoutes.indexOf(initial) || 0
  return (
    <div className='App'>
      <h1>Authn Router</h1>
      <MemoryRouter initialEntries={entryRoutes} initialIndex={initialIndex}>
        <Switch>
          <Route path='/FirstTime' component={FirstTime}></Route>
          <Route path='/CreateAccount' component={CreateAccount}></Route>
          <Route path='/Balances' component={Balances}></Route>
        </Switch>
      </MemoryRouter>
    </div>
  )
}

export default AuthnRouter
