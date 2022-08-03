import * as fcl from "@onflow/fcl"
import {yup, nope} from "../util"

const template = {
  "f_type": "InteractionTemplate",
  "f_vsn": "1.0.0",
  "id": "2bfccb5843ff13a522fb2c86afab6b330026b9c35173023c7bbec407ca8385e0",
  "data": {
    "type": "transaction",
    "interface": "",
    "author": {},
    "version": "1.0.0",
    "messages": {
      "i18n": {
        "Title": {
          "en-US": "Transfer FLOW"
        },
        "description": {
          "en-US": "Transfer FLOW from one account to another"
        }
      }
    },
    "cadence": "import FungibleToken from 0xFUNGIBLETOKENADDRESS\ntransaction(amount: UFix64, to: Address) {\nlet vault: @FungibleToken.Vault\nprepare(signer: AuthAccount) {\nself.vault <- signer\n.borrow<&{FungibleToken.Provider}>(from: /storage/flowTokenVault)!\n.withdraw(amount: amount)\n}\nexecute {\ngetAccount(to)\n.getCapability(/public/flowTokenReceiver)!\n.borrow<&{FungibleToken.Receiver}>()!\n.deposit(from: <-self.vault)\n}\n}",
    "dependencies": {
      "0xFUNGIBLETOKENADDRESS": {
        "testnet": {
          "address": "0x9a0766d93b6608b7",
          "contract": "FungibleToken",
          "fq_address": "A.0x9a0766d93b6608b7.FungibleToken",
          "pin": "c7edfc93e2c4e79c2b266ed9188a4c58331183db52dbda88b2f7cb46b0d5df7f",
          "pin_block_height": 67432643
        },
        "mainnet": {
          "address": "0xf233dcee88fe0abe",
          "contract": "FungibleToken",
          "fq_address": "A.0xf233dcee88fe0abe.FungibleToken",
          "pin": "c7edfc93e2c4e79c2b266ed9188a4c58331183db52dbda88b2f7cb46b0d5df7f",
          "pin_block_height": 28985392
        }
      }
    },
    "arguments": {
      "amount": {
        "index": 0,
        "messages": {
          "title": {
            "i18n": {
              "en-US": "Amount of FLOW to transfer"
            }
          }
        }
      },
      "to": {
        "index": 1,
        "messages": {
          "title": {
            "i18n": {
              "en-US": "Account to transfer FLOW to"
            }
          }
        }
      }
    }
  }
}

export const LABEL = "Mutate 3 (template | testnet)"
export const CMD = async () => {

  let network = "testnet"

  for (let key of Object.keys(template.data.dependencies)) {
    if (key?.[network]) {
      await fcl.config().put(key, key?.[network].address)
    }
  }

  let currentUser = fcl.currentUser()

  console.log("here!", currentUser)

  // prettier-ignore
  return fcl.mutate({
    template: "http://localhost:3030/templates/2bfccb5843ff13a522fb2c86afab6b330026b9c35173023c7bbec407ca8385e0",
    args: (arg, t) => [
      arg("0.0", t.UFix64),
      arg("0x25da746d3dd5a0b3", t.Address),
    ],
    limit: 50,
  }).then(yup("M-1"))
    .catch(nope("M-1"))
}
