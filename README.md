<br />
<p align="center">
  <h1 align="center"> Sample Flow Wallet Chrome Extension</h1>
  <p align="center">
    <i>Demo and guide to creating a FCL Chrome wallet extension on Flow.</i>
    <br />
    <a href="https://github.com/gregsantos/flow-wallet-extension/blob/master/docs/docs/index.md"><strong>Read the docs»</strong></a>
    <br />
    <br />
    <a href="https://docs.onflow.org/fcl/">FCL Readme</a>
    ·
    <a href="https://github.com/onflow/fcl-js/issues">Report Bug</a>
·
    <a href="https://developer.chrome.com/docs/extensions/reference/">Chrome API Docs</a>
  </p>
</p>

---

## Getting Started

### Setup

```shell
git clone https://github.com/gregsantos/flow-wallet-extension.git
cd flow-wallet-extension/
npm i
```

### Build

TODO: Fill in with new build instructions

To avoid getting Content Security Policy (CSP) errors after building. We need to tell CRA to place the extra code into a separate file for us by setting up an environment variable called INLINE_RUNTIME_CHUNK.

Because this environment variable is particular and only applies to the build, we won’t add it to the .env file. Instead, we will update our build command on the package.json file.

```shell
“build”: “INLINE_RUNTIME_CHUNK=false react-scripts build”,
```

The generated index.html will contain no reference to inline JavaScript code

### Run the harness
TODO: Fill out instructions here.

### Run the extension
TODO: Fill out instructions here.

## Build your own wallet
See the full guide to building an extension on Flow [here](#).
- [FCL EXT/RPC Guide](docs/#fcl-ext-rpc-guide)
  * [Overview](docs/#overview)
    + [FCL Fundamentals](docs/#fcl-fundamentals)
      - [Discovery](docs/#discovery)
      - [Service Methods](docs/#service-methods)
      - [Wallet Services](docs/#wallet-services)
    + [Browser & Extension Requirements](docs/#browser---extension-requirements)
    + [Key Scripts](docs/#key-scripts)
  * [Implementation](docs/#implementation)
    + [Manifest V3 configurations](docs/#manifest-v3-configurations)
    + [FCL Installation & Configuration](docs/#fcl-installation---configuration)
    + [Harness & Testing](docs/#harness---testing)
    + [FCL Discovery](docs/#fcl-discovery)
    + [Account Creation](docs/#account-creation)
    + [FCL Authentication](docs/#fcl-authentication)
    + [FCL Authorization](docs/#fcl-authorization)
    + [Other Services](docs/#other-services)
    + [Transaction History & Event Indexing](docs/#transaction-history---event-indexing)
    + [NFT Viewing & Metadata](docs/#nft-viewing---metadata)
    + [Other Resources](docs/#other-resources)



