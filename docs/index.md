# FCL Chrome Extension Wallet Guide (EXT/RPC)

_This guide will help you create an FCL-compatible Chrome browser extension._

## Overview

To get started, we will cover the most important aspects of Flow, the Flow Client Library (FCL), and Chrome's APIs relevant to building this extension. Get started by reading the [FCL README](https://docs.onflow.org/fcl/) for a high-level overview of FCL and its features.

### FCL Fundamentals

#### Discovery

Dapps on Flow are encouraged to use FCL's [Discovery API](https://github.com/onflow/fcl-discovery) via a simple [configuration](https://docs.onflow.org/fcl/reference/api/#discovery) to show the users all available and supported wallet choices for the dapp. This is so that dapps can support any and all wallets on Flow using the FCL interface without needing to write custom code or install SDKs for specific ones. To add yourself to this list, you will need to a submit a PR with your relevant wallet details once the wallet is ready for testnet or mainnet use.

#### Service Methods

Services methods are the communication channels that FCL can use to pass messages to and from your wallet in order to fulfill user interactions. For extensions, we will be using RPC in the browser to communicate between the wallet and the dapp. For more context on service methods, see other supported methods [here](https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/draft-v3.md#service-methods). Note that the EXT/RPC is not documented in the provider spec but is similar to the other front-channel communication methods such as IFRAME/RPC.

#### Wallet Services

Wallet services are the features that your wallet will support. Wallets on Flow can choose to implement any number of supported FCL services. In order to gain broad adoption by dapps on Flow, it is recommended to implement the following services at a minimum:

- **Authentication (Authn) Service:** The wallet can provide the user's wallet address to the dapp and is confident in the user's identity using any authentication mechanism.
- **Authorization (Authz) Service:** The wallet can provide the appropriate signatures for the on-chain transactions that the dapp requests.

For an in-depth view of FCL wallet services and methods, see this [guide](https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/draft-v3.md).

### Browser & Extension Requirements

- Chrome v99+
- Manifest V3 Required Permissions
  - [storage](https://developer.chrome.com/docs/extensions/reference/storage/): You must declare the `storage` permission in the extension manifest to use the storage API. The `keyVault` utility from the example extension use `localStorage` and `sessionStorage` to store data. `keyVault` data is serialized to JSON and stored unencrypted in `sessionStorage` during browser session and stored _encrypted_ in the `localStorage` between browser sessions.
  - [activeTab](https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/): The `activeTab` permission gives an extension temporary access to the currently active tab when the user invokes the extension (e.g. by clicking its action). Access to the tab lasts while the user is on that page, and is revoked when the user navigates away or closes the tab.
  - [alarms](https://developer.chrome.com/docs/extensions/reference/alarms/): Gives your extension access to the `chrome.alarms` API.

### Key Scripts

There are 3 key scripts that FCL relies on to allow message passing between the extension and the dapp. The global separation of context created by Chrome between the two and the availability of Chrome APIs within those contexts require these scripts to be setup in a particular sequence so that the communication channels needed by FCL's EXT/RPC service method will work.

The following is an overview of these scripts and the functionality they need to support FCL:

- **`background.js`**: Used to launch the extension with `chrome.windows.create` if selected by the user from Discovery or set directly via `fcl.config.discovery.wallet`
- **`content.js`**: Used to proxy messages between the dapp to the extension via `chrome.runtime.sendMessage`.
- **`script.js`**: Injected by `content.js` into the dapp's HTML page. It adds the extension `authn` service to `window.fcl_extensions` list on page load. This allows FCL to confirm installation and send extension details to Discovery or launch your wallet as the default wallet.

<details>
<summary>Application Context Diagram</summary>
<img src="img/ext-rpc-message-passing.png"/>
</details>

## Implementation

### Manifest V3 Configurations

Every Chrome extension requires a manifest file. All of the configurations for the extension belong in the `manifest.json` file, which you'll find in the public folder.

This file is generated automatically in the example extension. However, to be valid for an extension, it must follow the extension guidelines.

Content script files run in the context of the webpage. In our manifest file, we have to provide permission to sites where this script could run. In our case, we have declared it could run on all websites `["http://*/*", "https://*/*"]`.

```javascript

  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["content.js"]
    }
  ],

```

It also needs to declare permissions for any chrome APIs we would be using in our extension and any resources the webpage will need access to.

```javascript
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
  ],
```

See [here](../packages/extension/src/manifest.json) for the full sample manifest v3 file.

### FCL Installation & Configuration

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

### Harness & Testing

In order to test your FCL integration as you build your extension, you may want to use a simple sample dapp that can send authentication and authorization requests. We have created a barebones dapp to use for development that you can run and use against your extension. View the instructions on the [README](../README.md) to get it running.

### FCL Discovery

FCL relies on the global window object to find injected extensions in `window.fcl_extensions` list. It expects the extension to have injected a specific object into the array that it needs to confirm installation and proceed with authentication if the user chooses it. This `authn` type Service object is added via [`script.js`](../packages/extension/src/script.js) and passed to Discovery. It contains details like the extension endpoint to open on login (see below), the FCL version, and the wallet provider details.

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

> The endpoint of your `authn` and other services should be of the form **`ext:YOUR_WALLETS_FLOW_ACCOUNT_ADDRESS`**. You can choose any Flow address that you have the keys to and will the unique identifier for your wallet on Flow.

This endpoint is used by FCL and checked in your background script to conditionally open the extension popup window. It can optionally be used to set the extension as the default wallet via `fcl.discovery.wallet`

In order for the user to launch the extension from an unopened state, the following actions need to run in the following order:

1. `background.js` adds a listener via `chrome.runtime.onMessage.addListener(callback)`. The callback should confirm the service endpoint before opening the extension popup window.
2. `content.js` adds an event listener for messages from window/FCL. Messages received will be proxied to the extension via `chrome.runtime.sendMessage`. It also adds another listener via `chrome.runtime.onMessage.addListener` to proxy messages back from the extension to the window/FCL.
3. `content.js` injects a separate script (`script.js`) into the window as it has no access to page window variables.
4. `script.js` adds `authn` type Service on `window.fcl_extensions`. FCL checks for injected services to send to Discovery.
5. Discovery is able display the extension as an available choice for the user as it pulls from the `window.fcl_extensions` array for the relevant information. If the extension wallet is selected, FCL uses the authn service method (`EXT/RPC`) to send a postMessage with service `endpoint` and `type`. The content script receives this and proxies the message to the `background.js` to launch the extension. This is required due to the `chrome.windows.create` only being accessible by the background script.

Once the extension popup window is open, communication is proxied directly through `content.js` to and from the extension popup via `chrome.runtime.sendMessage` (content script) and `chrome.tabs.sendMessage` (extension popup).

<details>
<summary><b>FCL Discovery and Authn Sequence Diagram</b></summary>
<img src="img/ext-rpc-authn-sequence.png"/>
</details>

### Account Creation

Unlike on some other chains, [account addresses on Flow](https://docs.onflow.org/concepts/accounts-and-keys/) are not derived from public keys and instead are assigned in an on-chain transaction. As such, the account creation process is split into two steps: key generation and an account creation transaction.

#### Key Generation

For non-custodial wallets, we recommend following the [BIP-44 standard](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) to derive a keypair from a mnemonic seed phrase. This allows your user to save their seed phrase (12 or 24 words) and later use it to restore their account if they lose access to their wallet. [FLIP-200 describes how to apply BIP-44 to Flow](https://github.com/onflow/flow/pull/200).

Flow supports two ECDSA key curves: [secp256k1](https://en.bitcoin.it/wiki/Secp256k1) (also used by Bitcoin and Ethereum) and NIST P-256.

|Curve name|Flow Identifier|
|----------|---------------|
|secp256k1 |ECSDA_secp256k1|
|NIST P-256|ECDSA_P256     |

After generating the key pair, the raw public key is used inside the account creation transaciton. It must be in the following format:

```
rawPublicKey = hex(bigEndianBytes(x) + bigEndianBytes(y))
```

where `x` and `y` are the integer components of the public key.

#### Account Creation Transaction

The [Flow Account API](https://github.com/onflow/flow-account-api) is a simple service that assists with account creation for non-custodial wallets. It exposes an endpoint that accepts a public key and returns a newly-created account. Because there is no direct on-chain mapping from a public key to an account, the service also saves the public key -> address association. Your wallet can later query the service to fetch an account address by public key. This can be used if a user has forgotten their account address and needs to restore their wallet from a seed phrase.

A testnet version of the Account API is hosted at https://hardware-wallet-api-testnet.staging.onflow.org. The sample extension [shows how to call the testnet API](../src/pages/CreateAccount.js#L42-L54) from JavaScript.

If you are using the Account API, an account creation request looks like the following, where `publicKey` is the raw format described above.

```sh
curl --request POST \
  --url https://hardware-wallet-api-testnet.staging.onflow.org/accounts \
  --header 'content-type: application/json' \
  --data '{
	"publicKey": "6b1523db40836078eb6f80f8d4f934f03725a4e66574815b5d2a9f2ba5dcf9c483fc1b543392f6ada01cc13790f996d0969ee6f9c8d9190f54dc31f44be0a53b",
	"signatureAlgorithm": "ECDSA_P256",
	"hashAlgorithm": "SHA3_256"
}
'
```

### FCL Authentication

Authentication is triggered either through Discovery, default configuration (`fcl.config.discovery.wallet`) or through any FCL transaction that requires authentication. When authentication is requested, the following should happen:

1. On opening of the authentication tab on the extension, it should fire a message of `{type: "FCL:VIEW:READY"}` via `chrome.tabs.sendMessage` to indicate to the dapp that it should wait for a response from the user within the extension.
2. The dapp/FCL will respond with `FCL:VIEW:READY:RESPONSE` which is received by `content.js` and proxied to the extension authentication page. The dapp will wait for an approved polling response from the extension.
3. Once the user has successfully authenticated, the extension should send a message of type `PollingResponse` with the `status` field as `"APPROVED"` and an `AuthnResponse` with relevant service objects as data. See [sample authn page](../packages/extension/src/pages/services/Authn.js).

All messages above are proxied through `content.js`.

<details>
<summary><b>FCL Discovery and Authn Sequence Diagram</b></summary>
<img src="img/ext-rpc-authn-sequence.png"/>
</details>

### FCL Authorization

Authorization is very similar to authentication with the exception that the `"FCL:VIEW:READY:RESPONSE"` will contain additional data that contains the signable object (containing the relevant Cadence transaction, etc.).

The content script can also listen for `FLOW::TX` messages and proxy to the popup to recieve the status of the transaction.

In the `PollingResponse`, there should be a `data` field that contains a composite signature for the user's transaction.

> **This composite signature will be generated using the users keys and should be done securely.**

Although a [sample implementation](../packages/extension/) has been provided, you should thoroughly review your own signing functionality and ensure its security.

All messages above are proxied through `content.js`.

<details>
<summary><b>FCL Authz Sequence Diagram</b></summary>
<img src="img/ext-rpc-authz-sequence.png"/>
</details>

### Other Services

Guides on implementing other wallets services for EXT/RPC will be coming shortly.

### Transaction History & Event Indexing

As a wallet, you may want to index events in order to track and display your user's past transactions. We have two recommended pre-built options on Flow:

- [Flowscan API](#): Hosted API (private beta access only - contact Flow team) to get historical transactions from an account address among other data on Flow.
- [Graffle](https://graffle.io/): Hosted Service Provider to index and provide webhooks for events on smart contracts.
- [Flow Scanner](https://github.com/rayvin-flow/flow-scanner): Open-source event indexing service that you will have configure and host.

### NFT Viewing & Metadata

If you would like to support showing user's their NFTs and associated metadata, the current recommendation is to use the [Alchemy Flow API](https://docs.alchemy.com/flow/documentation/flow-nft-apis). The usage of the API is also demonstrated in the sample extension. While Alchemy will provide some basic metadata on the most popular Flow NFT projects, other projects and project specific fields will rely on their specific smart contract implementation. We have recently rolled out a NFT metadata standard that continues to evolve to solve this problem, read more about it [here](https://forum.onflow.org/t/introducing-nft-metadata-on-flow/2798).

### Other Resources

- Block Explorers
  - Flowscan
    - [Mainnet](https://flowscan.org/)
    - [Testnet](https://testnet.flowscan.org/)
  - [Flow-view-source](https://flow-view-source.com/)
- Payment On-ramp Providers
  - [Moonpay](https://www.moonpay.com/)
  - [Wyre](https://www.sendwyre.com/)
  - [Ramp](https://ramp.network/)
