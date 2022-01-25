import React, {useEffect, useState} from "react"
import {MemoryRouter, Switch, Route} from "react-router"
import Initial from "../pages/Initial"
import CreateAccount from "../pages/CreateAccount"
import SelectAccount from "../pages/SelectAccount"
import SetPassword from "../pages/SetPassword"
import LogIn from "../pages/LogIn"
import {keyVault} from "../lib/keyVault"
import {accountManager} from "../lib/AccountManager"
import Authn from "../pages/services/Authn"

function AuthnRouter() {
  const [loading, setLoading] = useState(true)
  const [initial, setInitial] = useState(null)
  const [opener, setOpener] = useState(null)

  useEffect(() => {
    async function setRoute() {
      if (keyVault.unlocked) {
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
          setInitial("/Initial")
        }
      }
      setLoading(false)
    }
    setRoute()
  }, [])

  useEffect(() => {
    /**
     * We can't use "chrome.runtime.sendMessage" for sending messages from React.
     * For sending messages from React we need to specify which tab to send it to.
     */
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: false,
        },
        tabs => {
          /**
           * Sends a single message to the content script(s) in the specified tab,
           * with an optional callback to run when a response is sent back.
           *
           * The runtime.onMessage event is fired in each content script running
           * in the specified tab for the current extension.
           */
          setOpener(tabs[0].id)
          chrome.tabs.sendMessage(
            tabs[0].id || 0,
            {type: "FCL:VIEW:READY"},
            response => {
              console.log(response)
            }
          )
        }
      )

    const messagesFromReactAppListener = (msg, sender, sendResponse) => {
      console.log("[App.js]. Message received", msg)

      if (msg.type === "FCL:VIEW:READY:RESPONSE") {
        console.log(
          "recieved view ready response",
          JSON.parse(JSON.stringify(msg || {}))
        )
      }
    }

    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    chrome.runtime?.onMessage.addListener(messagesFromReactAppListener)
  }, [])

  if (loading) {
    return null
  }

  const entryRoutes = ["/Initial", "/LogIn", "/Balances", "/SelectAccount"]
  const initialIndex = entryRoutes.indexOf(initial) || 0
  return (
    <MemoryRouter initialEntries={entryRoutes} initialIndex={initialIndex}>
      <Switch>
        <Route path='/Initial' component={Initial}></Route>
        <Route path='/CreateAccount' component={CreateAccount}></Route>
        <Route path='/SelectAccount' component={SelectAccount}></Route>
        <Route path='/SetPassword' component={SetPassword}></Route>
        <Route path='/LogIn' component={LogIn}></Route>
        <Route path='/Balances' component={Authn}></Route>
      </Switch>
    </MemoryRouter>
  )
}

export default AuthnRouter
