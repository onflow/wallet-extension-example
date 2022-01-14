import React from "react"
import "./App.css"

function App() {
  const [title, setTitle] = React.useState("")

  React.useEffect(() => {
    /**
     * We can't use "chrome.runtime.sendMessage" for sending messages from React.
     * For sending messages from React we need to specify which tab to send it to.
     */
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
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
              setTitle(response.title)
            }
          )
        }
      )
  }, [])

  return (
    <div className='App'>
      <h1>Flow Wallet Extension</h1>

      <ul className='Form'>
        <li className='Validation'>
          <div className='ValidationField'>
            <span className='ValidationFieldTitle'>Title</span>
            <span
              className={`ValidationFieldStatus ${
                title.length < 30 || title.length > 65 ? "Error" : "Ok"
              }`}
            >
              {title.length} Characters
            </span>
          </div>
          <div className='ValidationFieldValue'>{title}</div>
        </li>
      </ul>
    </div>
  )
}

export default App
