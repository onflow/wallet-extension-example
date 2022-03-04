# Example Flow Wallet Extension for Chrome

## Getting Started

### Install

```shell
npm i
```

### Build the extension

```shell

npm run dev --workspace fcl-wallet-extension-demo

```

### Add the extension to Chrome

- In Chrome, navigate to `chrome://extensions`
- Enable the "Developer mode" toggle
- Click on "Load unpacked"
- Select the `packages/extension/build` folder

### Refreshing the extension

If you make changes to the code, rebuild the extension with `npm run dev` and then click the refresh icon in the Chrome extensions page.
