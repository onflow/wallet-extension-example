import React, {useState, useEffect} from "react"
import {HashRouter as Router, Switch, Route} from "react-router-dom"
import {Box} from "@chakra-ui/react"
import AuthnRouter from "./routers/AuthnRouter"
import PopupRouter from "./routers/PopupRouter"
import Authz from "./pages/Authz"
import {keyVault} from "./lib/keyVault"
import {loadAccounts} from "./lib/AccountManager"
import "./App.css"

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      await keyVault.loadVault()
      const accounts = await loadAccounts()
      console.log("load accounts", accounts)
      setLoading(false)
    }
    load()
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

  return (
    <Router>
      <Box
        position='absolute'
        w={"375px"}
        h={"600px"}
        p={0}
        m={0}
        background='transparent'
      >
        <Switch>
          <Route exact path='/'>
            <PopupRouter />
          </Route>
          <Route exact path='/authn'>
            <AuthnRouter />
          </Route>
          <Route exact path='/authz'>
            <Authz></Authz>
          </Route>
        </Switch>
      </Box>
    </Router>
  )
}

export default App
