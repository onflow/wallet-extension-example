// import configureFcl from '../../flowConfig';
import FlowAccountManager from "./flowAccountManager"
let flowMainnetAccountManager = new FlowAccountManager({
  accountStoragePrefix: "flow_mainnet",
  accountNetwork: "Flow Mainnet",
})
let flowTestnetAccountManager = new FlowAccountManager({
  accountStoragePrefix: "flow_testnet",
  accountNetwork: "Flow Testnet",
})

// what everything should use to access accounts
// this should be chosen from storage at startup during loadAccounts
var accountManager = null

// each manager needs to be loaded once per app open
async function loadAccounts() {
  await flowMainnetAccountManager.load()
  await flowTestnetAccountManager.load()

  // set the global account manager to the latest used
  return await new Promise((resolve, reject) => {
    chrome.storage.local.get("selectedAccountManager", res => {
      if (res.selectedAccountManager) {
        accountManager = getManager(res.selectedAccountManager)
        // make sure fcl has the correct endpoint for this network
        // configureFcl(res.selectedAccountManager)
      } else {
        accountManager = flowTestnetAccountManager
        // configureFcl(res.selectedAccountManager)
      }
      resolve(true)
    })
  })
}

function switchManager(manager) {
  // switch the global account manager
  accountManager = getManager(manager)
  // make sure fcl has the correct endpoint for this network

  //configureFcl(manager)

  // store which account manager to use at startup
  chrome.storage.local.set({selectedAccountManager: manager})
}

function getManager(manager) {
  let ret = null
  switch (manager) {
    case "flow_mainnet":
      ret = flowMainnetAccountManager
      break
    case "flow_testnet":
      ret = flowTestnetAccountManager
      break
    default:
      ret = flowTestnetAccountManager
  }
  return ret
}

// used to build up the network selector options
const availableManagers = [flowMainnetAccountManager, flowTestnetAccountManager]

export {
  switchManager,
  loadAccounts,
  availableManagers,
  accountManager,
  flowMainnetAccountManager,
  flowTestnetAccountManager,
}
