// Function called when a new message is received
const extMessageHandler = ({type, service}, sender, sendResponse) => {
  // Message from FCL, posted to window and proxied from content.js
  // Launches extension popup window
  if (type === "FCL:LAUNCH:EXTENSION") {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      tabs => {
        let popUrl = chrome.runtime.getURL(`index.html#/${service.type}`)
        chrome.windows.create({
          url: popUrl,
          type: "popup",
          height: 628,
          width: 375,
          left: 1000,
        })
      }
    )
  }
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(extMessageHandler)
