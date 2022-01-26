import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

/*
    TODO
    These are hardcoded to testnet right now, should be replaced by
    non-hardcoded cadence scripts in the future, using cadencetojson
    or cadut
    
*/

const getFlowCode = `
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
pub fun main(account: Address): UFix64 {
    let vaultRef = getAccount(account)
        .getCapability(/public/flowTokenBalance)
        .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
`

const getFusdCode = `
import FUSD from 0xe223d8a629e49c68
import FungibleToken from 0x9a0766d93b6608b7
pub fun main(account: Address): UFix64 {
    let acct = getAccount(account)
    let vaultRef = acct.getCapability<&FUSD.Vault{FungibleToken.Balance}>(/public/fusdBalance)
        .borrow()
        
    if vaultRef == nil {
        return 0.0
    }
    return vaultRef!.balance
}
`

export const getTokenBalance = async (currency, address) => {
  let result
  const CODE = currency === "flow" ? getFlowCode : getFusdCode
  try {
    result = await fcl
      .send([
        fcl.script(CODE),
        fcl.args([fcl.arg(address, t.Address)]),
        fcl.limit(9999),
      ])
      .then(fcl.decode)
  } catch (e) {
    console.error(e)
    return 0.0
  }
  return parseFloat(result)
}
