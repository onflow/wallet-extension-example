let currentPopup = null;

function createPopup(popUrl) {

  function handlePopupClosed(windowId) {
    if (currentPopup && windowId == currentPopup.id) {
      currentPopup = null;
    }
  }

  try {
    if (!currentPopup) {
      chrome.windows
        .create({
          url: popUrl,
          type: "popup",
          height: 628,
          width: 375,
          left: 1000,
        })
        .then((window) => {
          currentPopup = window;
          chrome.windows.onRemoved.addListener(handlePopupClosed);
        });
    }
  } catch (error) {
    console.log("error: ", error);
  }
}

// Function called when a new message is received
const extMessageHandler = (msg) => {
  // Messages from FCL, posted to window and proxied from content.js
  const { service } = msg;
  // Launches extension popup window
  if (service?.endpoint && service?.endpoint === "ext:0x1234") {
    chrome.tabs.query(
      {
        url: "http://localhost:3000/*",
      },
      (tabs) => {
        createPopup(chrome.runtime.getURL(`index.html#/${service.type}`))
      }
    );
  }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(extMessageHandler);
