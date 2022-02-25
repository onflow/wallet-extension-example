/**
 * Inject script, to provide access to window shared with FCL
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
  console.log("CS Listener", event.data)
  chrome.runtime.sendMessage(event.data)
})

// Listener for Custom Flow Transaction event from FCL send, uses ext uid for CustomEvent name
/* window.addEventListener(`FCL:LAUNCH:EXTENSION:flowwallet`, function (event) {
  chrome.runtime.sendMessage({type: "FCL:LAUNCH:EXTENSION", ...event.detail})
}) */

// Listener for Custom Flow Transaction event from FCL send
window.addEventListener("FLOW::TX", function (event) {
  chrome.runtime.sendMessage({type: "FLOW::TX", ...event.detail})
})

const extMessageHandler = (msg, sender, sendResponse) => {
  if (msg.type === "FCL:VIEW:READY") {
    window && window.postMessage(JSON.parse(JSON.stringify(msg || {})), "*")
  }

  if (msg.f_type && msg.f_type === "PollingResponse") {
    window &&
      window.postMessage(
        JSON.parse(JSON.stringify({...msg, type: "FCL:VIEW:RESPONSE"} || {})),
        "*"
      )
  }

  if (msg.type === "FCL:VIEW:CLOSE") {
    window && window.postMessage(JSON.parse(JSON.stringify(msg || {})), "*")
  }
}

/**
 * Fired when a message is sent from either an extension process or another content script.
 */
chrome.runtime.onMessage.addListener(extMessageHandler)

// send extension id to injexted script
var extId = chrome.runtime.id
setTimeout(() => {
  document.dispatchEvent(
    new CustomEvent(`EXT:INJECT:SCRIPT:flowwallet`, {
      detail: {
        extId: extId,
      },
    })
  )
}, 500)
