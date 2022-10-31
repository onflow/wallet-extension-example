let currentPopup = null;

function createPopup(hostTabId, service) {
  function handlePopupClosed(windowId) {
    if (currentPopup && windowId == currentPopup.id) {
      currentPopup = null;
    }
  }

  if (!currentPopup) {
    const tabIdParam = new URLSearchParams({
      tabId: hostTabId,
    });
    const popUrl = chrome.runtime.getURL(
      `index.html?${tabIdParam}#/${service.type}`
    );

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
  } else {
    chrome.scripting.executeScript({
      target: { tabId: hostTabId },
      function: () =>
        alert(
          "Extension is ignoring given request because it can only have one popup at a time. Make sure to close the current popup before making another request"
        ),
    });
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
        active: true,
        lastFocusedWindow: true,
      },
      (tabs) => {
        // pass in current tab's tabId to URL so extension can use it to send message back to FCL
        createPopup(tabs[0].id, service);
      }
    );
  }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(extMessageHandler);
