/**
 * Inject script
 */
function injectScript(file_path, tag) {
  var node = document.getElementsByTagName(tag)[0]
  var script = document.createElement("script")
  script.setAttribute("type", "text/javascript")
  script.setAttribute("src", file_path)
  node.appendChild(script)
}

injectScript(chrome.runtime.getURL("script.js"), "body")

// Listener for messages from window/FCL
window.addEventListener("message", function (event) {
  console.log("Message Received from window in contentScript", event.data)
  if (event.data.type && event.data.type === "SHOW_POPUP") {
    chrome.runtime.sendMessage({type: event.data.type})
  }
})

var id = chrome.runtime.id
setTimeout(() => {
  document.dispatchEvent(
    new CustomEvent("_my_custom_event", {
      detail: {
        id: id,
      },
    })
  )
}, 2000)

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
