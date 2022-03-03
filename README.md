<br />
<p align="center">
  <h1 align="center"> Sample Flow Wallet Chrome Extension</h1>
  <p align="center">
    <i>Demo and guide to creating an FCL Chrome wallet extension on Flow.</i>
    <br />
    <a href="https://github.com/gregsantos/flow-wallet-extension/blob/master/docs/index.md"><strong>Read the docs»</strong></a>
    <br />
    <br />
    <a href="https://docs.onflow.org/fcl/">FCL Readme</a>
    ·
    <a href="https://github.com/onflow/fcl-js/issues">Report a Bug</a>
·
    <a href="https://developer.chrome.com/docs/extensions/reference/">Chrome API Docs</a>
  </p>
</p>

## Getting started

### Setup

```shell
git clone https://github.com/gregsantos/flow-wallet-extension.git

cd flow-wallet-extension
cd extension

npm i

npm run dev
```

#### Install the extension

Load your extension in Chrome:

- In Chrome, navigate to `chrome://extensions`
- Enable the "Developer mode" toggle
- Click on "Load unpacked"
- Select the `extension/build` folder

#### Refreshing the extension

If you make changes to the code, rebuild the extension with `npm run dev` and then click the refresh icon in the Chrome extensions page.

### Start the harness app

The harness is a barebones web app that allows you to 
connect to the extension and send transactions.

```sh
cd harness

npm i

npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## Build your own wallet

See the full guide to building an extension on Flow [here](docs/index.md).

  * [Overview](docs/index.md#overview)
    + [FCL Fundamentals](docs/index.md#fcl-fundamentals)
      - [Discovery](docs/index.md#discovery)
      - [Service Methods](docs/index.md#service-methods)
      - [Wallet Services](docs/index.md#wallet-services)
    + [Browser & Extension Requirements](docs/index.md#browser---extension-requirements)
    + [Key Scripts](docs/index.md#key-scripts)
  * [Implementation](docs/index.md#implementation)
    + [Manifest V3 configurations](docs/index.md#manifest-v3-configurations)
    + [FCL Installation & Configuration](docs/index.md#fcl-installation---configuration)
    + [Harness & Testing](docs/index.md#harness---testing)
    + [FCL Discovery](docs/index.md#fcl-discovery)
    + [Account Creation](docs/index.md#account-creation)
    + [FCL Authentication](docs/index.md#fcl-authentication)
    + [FCL Authorization](docs/index.md#fcl-authorization)
    + [Other Services](docs/index.md#other-services)
    + [Transaction History & Event Indexing](docs/index.md#transaction-history---event-indexing)
    + [NFT Viewing & Metadata](docs/index.md#nft-viewing---metadata)
    + [Other Resources](docs/index.md#other-resources)
