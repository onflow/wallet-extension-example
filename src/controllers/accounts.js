import {keyVault} from "../lib/keyVault"
import FlowAccount from "../lib/flowAccount"
import {accountManager} from "../lib/AccountManager"
import * as fcl from "@onflow/fcl"
import {sign} from "./signatures"
import {toHex, prependUserDomainTag} from "./helpers"

export const createOrImportAccount = async (
  accountAddress,
  privKey,
  keyID,
  password
) => {
  accountAddress = fcl.withPrefix(accountAddress)
  if (!accountAddress || accountAddress.length !== 18) {
    throw new Error("Invalid account provided")
  }
  if (!privKey || privKey.length === 0) {
    throw new Error("Invalid private key provided")
  }
  if (!keyID || parseInt(keyID) === NaN) {
    throw new Error("Invalid Key ID provided")
  }
  const accountInfo = await fcl
    .send([fcl.getAccount(accountAddress)])
    .then(fcl.decode)

  const keys = accountInfo.keys
  const selectedKey = keys[keyID]
  if (!selectedKey) {
    throw new Error("Given key ID does not exist on given account.")
  }
  if (selectedKey.weight !== 1000) {
    throw new Error("Key with weight of 1000 required for import.")
  }
  if (selectedKey.revoked) {
    throw new Error("Provided Key ID is revoked")
  }

  const account = new FlowAccount({
    address: accountAddress,
  })
  await account.addKey(
    keyID,
    selectedKey.publicKey,
    selectedKey.weight,
    selectedKey.signAlgo,
    selectedKey.hashAlgo
  )
  await accountManager.importAccount(account)
  await keyVault.unlockVault(password)
  await keyVault.addKey(selectedKey.publicKey, privKey, password)
  await accountManager.setFavoriteAccount(accountAddress)
}

export const validateFlowAccountInfo = async (
  accountAddress,
  privKey,
  keyID
) => {
  accountAddress = fcl.withPrefix(accountAddress)
  if (!accountAddress || accountAddress.length !== 18) {
    throw new Error("Invalid account provided")
  }
  if (!privKey || privKey.length === 0) {
    throw new Error("Invalid private key provided")
  }
  if (!keyID || parseInt(keyID) === NaN) {
    throw new Error("Invalid Key ID provided")
  }

  const accountInfo = await fcl
    .send([fcl.getAccount(accountAddress)])
    .then(fcl.decode)
  const keys = accountInfo.keys
  const selectedKey = keys[keyID]
  if (!selectedKey) {
    throw new Error("Given key ID does not exist on given account.")
  }
  if (selectedKey.weight !== 1000) {
    throw new Error("Key with weight of 1000 required for import.")
  }
  if (selectedKey.revoked) {
    throw new Error("Provided Key ID is revoked")
  }
  // Create (but don't save) an ephemeral account with this key. This will be used to make signatures
  const account = new FlowAccount({
    address: accountAddress,
  })

  await account.addKey(
    keyID,
    accountInfo,
    selectedKey.weight,
    selectedKey.signAlgo,
    selectedKey.hashAlgo
  )

  const msg = toHex(`${accountAddress}`)
  const sig = await sign(account, keyID, privKey, prependUserDomainTag(msg))

  const compSig = new fcl.WalletUtils.CompositeSignature(
    accountAddress,
    keyID,
    sig
  )
  const verification = await fcl.verifyUserSignatures(msg, [compSig])

  if (!verification) {
    throw new Error("Private key not valid for this account")
  }
}

export const derivePrivKey = async seedPhrase => {
  throw new Error(
    "Seed phrases not yet supported - raw private keys only for now!"
  )
}

export const rotateFlowAccountKey = async accountAddress => {
  throw new Error("Key rotation not yet supported")
}
