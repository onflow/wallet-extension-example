const messagesFromReactAppListener = (msg, sender, sendResponse) => {
  console.log("[content.js]. Message received", msg)

  const response = {
    title: document.title,
  }

  console.log("[content.js]. Message response", response)

  sendResponse(response)
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener)
