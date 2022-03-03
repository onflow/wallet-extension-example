<br />
<p align="center">
  <h1 align="center">EXAMPLE FLOW WALLET EXTENSION FOR CHROME</h1>
  <p align="center">
    <i>Build an FCL-compatible Chrome extension wallet for Flow.</i>
    <br />
    <a href="https://docs.onflow.org/fcl/"><strong>Read the FCL docs»</strong></a>
    <br />
    <br />
    <a href="https://docs.onflow.org/fcl/tutorials/flow-app-quickstart/">Quickstart</a>
    ·
    <a href="https://github.com/onflow/fcl-js/issues">Report a Bug</a>
·
    <a href="https://developer.chrome.com/docs/extensions/reference/">Chrome API Docs</a>
  </p>
</p>

---

## Getting Started

### Build the Extension

```sh
cd extension
```

```sh
npm install
```

```sh
npm run build
```

#### Install the extension

Load your extension in Chrome:

- In Chrome, navigate to `chrome://extensions`
- Enable the "Developer mode" toggle
- Click on "Load unpacked"
- Select the `extension/build` folder

#### Refreshing the extension

If you make changes to the code, rebuild the extension with `npm run build` and then click the refresh icon in the Chrome extensions page.

### Start the Web App

The sample web app in this repository allows you to connect to the extension
and send transactions.

```sh
cd app
```

```sh
npm i
```

```sh
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## Extension configuration (manifest.json)

Every chrome extension requires a manifest file. All of the configurations for the extension belong in the manifest.js file, which you'll find in the public folder.

This file is generated automatically by CRA. However, to be valid for an extension, it must follow the extension guidelines. Note this example uses manifest v3.

We will be using a popup, background script, and content script in our extension which we will be declaring in our manifest file.

Content script files run in the context of the webpage. In our manifest file, we have to provide permission to sites where this script could run. In our case, we have declared it could run on all websites ["http://*/*", "https://*/*"].

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

Important fields

- manifest_version: version for the manifest format we want to use in our project
- action: actions allow you to customize the buttons that appear on the Chrome toolbar, which usually trigger a pop-up with the extension UI. In our case, we define that we want our button to start a pop-up with the contents of our index.html, which hosts our application

---

## Configuring your App for development

```js
// in the browser
import * as fcl from "@onflow/fcl";

fcl.config({
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Endpoint set to Testnet
});

fcl.authenticate();
```

---

## Wallet Discovery

It can be difficult to get users to discover new wallets on a chain. To solve this, we created a wallet discovery service that can be configured and accessed through FCL to display all available Flow wallet providers to the user. This means:

- Dapps can display and support all FCL compatible wallets that launch on Flow without needing to change any code
- Users don't need to sign up for new wallets - they can carry over their existing one to any dapp that uses FCL for authentication and authorization.

The discovery feature can be used via API allowing you to customize your own UI or you can use the default UI without any additional configuration.

---

## Message Passing Between FCL and Extension

Content Script will make use of sendMessage to send the data.

we will add an event listener which will listen for any message coming from content script.
`chrome.runtime.onMessage.addListener`

---

## Create or import an account

---

## Authentication

- _Interact with smart contracts_: Authorize transactions via the user's chosen wallet
- _Prove ownership of a wallet address_: Signing and verifying user signed data

[Learn more about wallet interactions >](https://docs.onflow.org/fcl/reference/api/#wallet-interactions)

## Authorization

- _Mutate the chain_: Send arbitrary transactions with your own signatures or via a user's wallet to perform state changes on chain.

```js
import * as fcl from "@onflow/fcl";
// in the browser, FCL will automatically connect to the user's wallet to request signatures to run the transaction
const txId = await fcl.mutate({
  cadence: `
    import Profile from 0xba1132bc08f82fe2
    
    transaction(name: String) {
      prepare(account: AuthAccount) {
        account.borrow<&{Profile.Owner}>(from: Profile.privatePath)!.setName(name)
      }
    }
  `,
  args: (arg, t) => [arg("myName", t.String)],
});
```

[Learn more about on-chain interactions >](https://docs.onflow.org/fcl/reference/api/#on-chain-interactions)

## Next Steps

See the [Flow App Quick Start](https://docs.onflow.org/flow-js-sdk/flow-app-quickstart).

See the full [API Reference](https://docs.onflow.org/fcl/api/) for all FCL functionality.

Learn Flow's smart contract language to build any script or transactions: [Cadence](https://docs.onflow.org/cadence/).

Explore all of Flow [docs and tools](https://docs.onflow.org).

---

## Communication Sequence

FCL is agnostic to the communication channel and be configured to create both custodial and non-custodial wallets. This enables users to interact with wallet providers without needing to download an app or extension.

The communication channels involve responding to a set of pre-defined FCL messages to deliver the requested information to the dapp. Implementing a FCL compatible wallet on Flow is as simple as filling in the responses with the appropriate data when FCL requests them. If using any of the front-channel communication methods, FCL also provides a set of [wallet utilities](https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-utils/index.js) to simplify this process.

### Building a FCL compatible wallet

- Read the [wallet guide](https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/draft-v3.md) to understand the implementation details.
- Review the architecture of the [FCL dev wallet](https://github.com/onflow/fcl-dev-wallet) for an overview.
- If building a non-custodial wallet, see the [Account API](https://github.com/onflow/flow-account-api) and the [FLIP](https://github.com/onflow/flow/pull/727) on derivation paths and key generation.
