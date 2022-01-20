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
  if (event.data.type && event.data.type === "FCL:OPEN:EXTENSION") {
    chrome.runtime.sendMessage(event.data)
  }
  if (event.data.type && event.data.type === "FCL:VIEW:READY:RESPONSE") {
    chrome.runtime.sendMessage(event.data)
  }
})

const messagesFromReactAppListener = (msg, sender, sendResponse) => {
  console.log("[content.js]. Message received", msg)

  if (msg.type === "FCL:VIEW:READY") {
    console.log(
      "CS: recieved view ready",
      JSON.parse(JSON.stringify(msg || {}))
    )

    window && window.postMessage(JSON.parse(JSON.stringify(msg || {})), "*")
  }

  if (msg.f_type && msg.f_type === "AuthnResponse") {
    console.log(
      "CS: recieved authn response",
      JSON.parse(JSON.stringify({...msg, type: "FCL:VIEW:RESPONSE"} || {}))
    )

    window &&
      window.postMessage(
        JSON.parse(
          JSON.stringify(
            {
              f_type: "PollingResponse",
              f_vsn: "1.0.0",
              status: "APPROVED",
              reason: null,
              data: msg,
              type: "FCL:VIEW:RESPONSE",
            } || {}
          )
        ),
        "*"
      )
  }
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener)

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
