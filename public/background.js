// Function called when a new message is received
const messagesFromReactAppListener = (msg, sender, sendResponse) => {
  console.log("[background-script.js]. Message received", msg.type)

  if (msg.type === "SHOW_POPUP") {
    chrome.windows.create(
      {
        url: chrome.runtime.getURL("index.html"),
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
  // Prepare the response object
  /*   const response = {
    msg: "Response from background.js",
  }

  sendResponse(response) */
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener)
