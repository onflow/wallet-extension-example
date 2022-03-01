// Function called when a new message is received
const extMessageHandler = (msg, sender, sendResponse) => {
  // Messages from FCL, posted to window and proxied from content.js
  const {service} = msg
  // Launches extension popup window
  if (service?.endpoint && service?.endpoint === "ext:0x1234") {
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
