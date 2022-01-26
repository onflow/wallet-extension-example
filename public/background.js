// Function called when a new message is received
const messagesFromReactAppListener = (
  {type, service},
  sender,
  sendResponse
) => {
  console.log("[background-script.js]. Message received", type, service)

  if (type === "FCL:OPEN:EXTENSION") {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      tabs => {
        let popUrl = chrome.runtime.getURL(`index.html#/${service.type}`)
        chrome.windows.create(
          {
            url: popUrl,
            type: "popup",
            height: 628,
            width: 375,
            left: 1000,
          },
          function (win) {
            console.log("window obj", win)
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
