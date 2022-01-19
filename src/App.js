import React, {useState, useEffect} from "react"
import {HashRouter as Router, Routes, Route} from "react-router-dom"
import AuthnRouter from "./routers/AuthnRouter"
import PopupRouter from "./routers/PopupRouter"
import Authz from "./pages/Authz"
import "./App.css"

function App() {
  const [opener, setOpener] = useState(null)
  function sendAuthnToFCL() {
    chrome.tabs.sendMessage(parseInt(opener), {
      f_type: "AuthnResponse",
      f_vsn: "1.0.0",
      addr: "0x1",
      services: [
        {
          f_type: "Service",
          f_vsn: "1.0.0",
          type: "authn",
          uid: "fcl-dev-wallet#authn",
          endpoint: `fcl/authn`,
          id: "0x1",
          identity: {
            address: "0x1",
          },
          provider: {
            address: null,
            name: "FCL Dev Wallet",
            icon: null,
            description: "For Local Development Only",
          },
        },
        {
          f_type: "Service",
          f_vsn: "1.0.0",
          type: "authz",
          uid: "fcl-dev-wallet#authz",
          endpoint: `fcl/authz`,
          method: "IFRAME/RPC",
          identity: {
            address: "0x1",
            keyId: Number(0),
          },
        },
      ],
    })
  }

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

  return (
    <div className='App'>
      <h1>Flow Wallet Extension</h1>

      <Router>
        <Routes>
          <Route exact path='/' element={<PopupRouter />} />
          <Route exact path='authn' element={<AuthnRouter />} />
          <Route exact path='authz' element={<Authz />} />
        </Routes>
      </Router>
      <div>
        <button onClick={sendAuthnToFCL}>LOGIN</button>
      </div>
    </div>
  )
}

export default App
