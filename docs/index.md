# FCL EXT/RPC Guide

*This guide will help you create a FCL compatible Chrome browser extension.*

## Overview
To get started, we will cover the most important aspects of Flow, FCL, and Chrome's APIs relevant to building this extension. Get started by reading the [FCL Overview](https://docs.onflow.org/fcl/) for a high level view of FCL and all its features. For an in-depth view of FCL communication patterns, see this [guide](https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/draft-v3.md).

### FCL Fundamentals

#### Discovery
Dapps on Flow are encouraged to use FCL's [Discovery API](https://github.com/onflow/fcl-discovery) via a simple [configuration](https://docs.onflow.org/fcl/reference/api/#common-configuration-keys). This is so that dapps can support all wallets on Flow using the FCL interface without needing any custom code for specific ones. To become available on this list, you will need to a submit a PR to add your wallet to this list once the wallet is ready for testnet or mainnet use.

#### Service Methods
Services methods are the communication channels that FCL can use to pass messages to and from your wallet in order to fulfill user interactions. For extensions, we will be using RPC in the browser to communicate between the wallet and the dapp. For more context on service methods, see other supported methods [here](https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/draft-v3.md#service-methods). Note that the EXT/RPC is not documented in the provider spec but is similar to the other front-channel communication methods.

#### Wallet Services
Wallet services are the features that your wallet will support. Wallets on Flow can choose to implement any number of supported FCL services. In order to gain broad adoption, it is reccomended to implement the following minimum:
- **Authentication (Authn) Service:** The wallet can provide the user's wallet address to the dapp and is confident in the user's identity using any authentication mechanism.
- **Authorization (Authz) Service:** The wallet can provide the appropriate signatures for transactions that the dapp requests.

See [here](https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/draft-v3.md#overview) for a list of all supported FCL services, 



### Browser & Extension Requirements
- Chrome v99+
- Manifest V3 Required Permissions
  - [storage](https://developer.chrome.com/docs/extensions/mv3/manifest/storage/): TODO: Add reason
  - [activeTab](https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/): TODO: Add reason
  - [alarms](https://developer.chrome.com/docs/extensions/reference/alarms/): TODO: Add reason

### Key Scripts
There are 3 key scripts that FCL relies on to allow message passing between the extension and the dapp. The global separation of context created by Chrome between the two and the availability of Chrome APIs within those contexts require these scripts to be setup in a particular sequence so that the communication channels needed by FCL's EXT/RPC service method will work.

The following is an overview of these scripts and the functionality they need to support FCL:
- `background.js`: Used to launch the extension with `chrome.windows.create` if selected by the user from Discovery or set directly via `fcl.config.discovery.wallet`
- `content.js`: Used to proxy messages between the dapp to the extension via `chrome.runtime.sendMessage`.
- `script.js`: Injected by `content.js` into the brower page shared with the dapp. Adds the extension `authn` service to `window.fcl_extensions` list on load. This allows FCL to confirm installation and send extension details to Discovery or launch as default wallet.

![FCL Authz Sequence Diagram](img/ext-rpc-message-passing.png)
<details>
<summary>Application Context Diagram</summary>
<img src="/img/ext-rpc-message-passing.png"/>
</details>

## Implementation

### Installation & Configuration

Use the following versions of FCL within your extension - available via [NPM](https://www.npmjs.com/package/@onflow/fcl):
- **FCL Version**: `^0.0.79-alpha.3` 
- **HTTP Transport**: `^0.0.6`
    - Requires separate http-transport package from `@onflow/transport-http` installed as dependency

Configure FCL to use the HTTP API on the Access Node with the HTTP transport layer.

```js
import {config} from "@onflow/fcl"
import {send as httpSend} from "@onflow/transport-http"

config()
  fclConfig.put("accessNode.api", "https://rest-testnet.onflow.org")
  fclConfig.put("sdk.transport", httpSend)
```

See [here](https://docs.onflow.org/fcl/reference/configure-fcl/) for more configuration options. Note, that many of these configuration options are dapp specific and not needed for the wallet.

**Manifest V3 configurations:**

```json
  ...

  "action": {
    "default_popup": "index.html",
    "default_title": "Open the popup"
  },
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["content.js"]
    }
  ],
  "permissions": [
    "activeTab", 
    "storage", 
    "alarms"
  ],
  "web_accessible_resources": [
    {
      "resources": ["index.html", "script.js"],
      "matches": ["<all_urls>"]
    }
  ]

  ...
```

See [here](https://github.com/gregsantos/flow-wallet-extension/blob/master/public/manifest.json) for the full sample manifest v3 file.

### Harness & Testing

In order to test your FCL integration as you build your extension, you may want to use a simple sample dapp that can send authentication and authorization requests. We have created a [basic harness](https://github.com/orodio/harness) to use for development that you can download, run, and use against your extension. View the instructions on the harness to get it running.



### FCL Discovery

FCL relies on the global window object to find injected extensions in `window.fcl_extensions` list. It expects the extension to have injected a specific object into the array that it needs to confirm installation and proceed with authentication if the user chooses it. This `authn` type Service object is added via [`script.js`](#) and passed to Discovery. It contains details like the extension endpoint to open on login (see below), the FCL version, and the wallet provider details.

```js
const AuthnService = {
  f_type: "Service",
  f_vsn: "1.0.0",
  type: "authn",
  uid: `uniqueDedupeKey`,
  endpoint: `ext:0x1234`,
  method: "EXT/RPC",
  ...
}

if (!Array.isArray(window.fcl_extensions)) {
  window.fcl_extensions = []
}
window.fcl_extensions.push(AuthnService)
```

The endpoint of your `authn` and other services should be of the form `ext:YOUR_WALLETS_FLOW_ACCOUNT_ADDRESS`. This endpoint is used by FCL and checked in your background script to conditionally open the extension popup window. It can optionally be used to set the extension as the default wallet via `fcl.discovery.wallet`

In order for the user to launch the extension from an unopened state, the following actions need to run in the following order:

1. `background.js` adds a listener via `chrome.runtime.onMessage.addListener(callback)`. The callback should confirm the service endpoint before opening the extension popup window.
2. `content.js` adds an event listener for messages from window/FCL. Messages received will be proxied to the extension via `chrome.runtime.sendMessage`. It also adds another listener via `chrome.runtime.onMessage.addListener` to proxy messages back from the extension to the window/FCL.
3. `content.js` injects a separate script (`script.js`) into the window as it has no access to page window variables.
4. `script.js` adds `authn` type Service on `window.fcl_extensions`. FCL checks for injected services to send to Discovery.
5. Discovery is able display the extension as an available choice for the user as it pulls from the `window.fcl_extensions` array for the relevant information. If the extension wallet is selected, FCL uses the authn service method (`EXT/RPC`) to send a postMessage with service `endpoint` and `type`. The content script receives this and proxies the message to the `background.js` to launch the extension. This is required due to the `chrome.windows.create` only being accessible by the background script.

Once the extension popup window is open, communication is proxied directly through `content.js` to/from the extension popup via `chrome.runtime.sendMessage` (content script) and `chrome.tabs.sendMessage` (extension popup).

<details>
<summary>FCL Discovery and Authn Sequence Diagram</summary>
<img src="/img/ext-rpc-authn-sequence.png"/>
</details>

### Account Creation
TODO: How to generate accounts and use the Account API

### FCL Authentication

Authentication is triggered either through Discovery, default configuration (fcl.config.discovery.wallet) or through any FCL transaction that requires authentication. When authentication is requested, the following should happen:

1. On opening of the authentication tab on the extension, it should fire a message of `{type: "FCL:VIEW:READY"}` via `chrome.tabs.sendMessage` to indicate to the dapp that it should wait for a response from the user within the extension. See [sample authn page](#).
2. The dapp/FCL will respond with `FCL:VIEW:READY:RESPONSE` which is received by `content.js` and proxied to the extension authentication page. The dapp will wait for an approved polling response from the extension.
3. Once the user has successfully authenticated, the extension should send a message of type `PollingResponse` with the `status` field as `"APPROVED"` and an `AuthnResponse` with relevant service objects as data. See [sample authn page](#).

All messages above are proxied through `content.js`.

![FCL Authz Sequence Diagram](img/ext-rpc-authn-sequence.png)
<details>
<summary>FCL Discovery and Authn Sequence Diagram</summary>
<img src="/img/ext-rpc-authn-sequence.png"/>
</details>

### FCL Authorization
Authorization is very similar to authentication with the exception that the `"FCL:VIEW:READY:RESPONSE"` will contain additional data that contains the signable object (containing the relevant Cadence transaction, etc.).

The content script can also listen for `FLOW::TX` messages and proxy to the popup to recieve the status of the transaction.

In the `PollingResponse`, there should be a `data` field that contains a composite signature for the user's transaction.

> **This composite signature will be generated using the users keys and should be done securely.**

Although a [sample implementation](#) has been provided, you should thoroughly review your own signing functionality and ensure its security.

All messages above are proxied through `content.js`.

![FCL Authz Sequence Diagram](img/ext-rpc-authz-sequence.png)
<details>
<summary>FCL Authz Sequence Diagram</summary>
<img src="img/ext-rpc-authz-sequence.png"/>
</details>

### Other Services
Guides on implementing other wallets services for EXT/RPC will be coming shortly.

### Transaction History & Event Indexing
As a wallet, you may want to index events in order to track and display your user's past transactions. We have two recommended pre-built options on Flow:
- [Graffle](#): Hosted Service Provider
- [Flow Scanner](#): Open-source event indexing service that you will have configure and host


### NFT Viewing & Metadata
If you would like to support showing user's their NFTs and associated metadata, the current recommendation is to use the [Alchemy Flow API](https://docs.alchemy.com/flow/documentation/flow-nft-apis). The usage of the API is also demonstrated in the sample extension. While Alchemy will provide some basic metadata on the most popular Flow NFT projects, other projects and project specific fields will rely on their specific smart contract implementation. We have recently rolled out a NFT metadata standard that continues to evolve to solve this problem, read more about it [here](https://forum.onflow.org/t/introducing-nft-metadata-on-flow/2798).

### Other Resources
TODO: Useful Flow tooling, Other services (moonpay, etc.), Chrome extension guides
