// Function called when a new message is received
const messagesFromReactAppListener = (msg, sender, sendResponse) => {
  console.log("[background-script.js]. Message received", msg.type)

  if (msg.type === "FCL:OPEN:EXTENSION") {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      tabs => {
        let popUrl = chrome.runtime.getURL("index.html")

        chrome.windows.create(
          {
            url: `${popUrl}?opener=${tabs[0].id}`,
            type: "popup",
            height: 598,
            width: 375,
            left: 1000,
          },
          function (win) {
            console.log(win)
            // win represents the Window object from windows API
            // Send VIEW READY to content script
            // here or in react?
          }
        )
      }
    )
  }
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener)
