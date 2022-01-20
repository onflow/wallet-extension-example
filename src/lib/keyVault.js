/*
  For backwards Compatibility for Extension Manifest V3 to V2
  which we are temporarily using in order to use FCL
  until the CSP concerns are addressed in FCL.

  Use local storage in place of session storage
  and browser action in place of action
*/

if (!chrome.storage.session) {
  chrome.storage.session = chrome.storage.local
}
if (!chrome.action) {
  chrome.action = chrome.browserAction
}

// Utility for storing keys
// Should be a singleton created at startup

// Serialized to JSON and stored unencrypted in sessionStorage during browser session
// Serialized to JSON and store _encrypted_ in the localStorage for between browser sessions

// The vault in localStorage will have:
// data: the encrypted data
// iv: the IV for encrypted data
// salt: the salt for encrypted data
// this is all handled by passworder, so don't need to deal with values

// The serialized data will have a list of "keys" of the form:
// type: the key type, such as a simple private key (key-import) or an HD Tree (not supported yet)
// address: address for this key
// key: for simple private key will be hex, for a HD Tree would be more a complex object starting with the mnemonic

// This object will maintain a map from address to private key for the caller

var passworder = require("browser-passworder")

class KeyVault {
  constructor(opts = {}) {
    // tells the caller if they can read data yet or not
    this.unlocked = false
    // address to private key Map. Callers will pass an address to get the key
    this.keyMap = new Map()
  }

  // decrypt the data from localStorage and keep in this object as well as sessionStorage
  async unlockVault(password) {
    // take encrypted data from localStorage and push it into sessionStorage
    return await new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get("encrypted_vault", async blob => {
          this.unlocked = true
          if (JSON.stringify(blob) === "{}") {
            // nothing has been saved to disk yet, start fresh
            this._setBadgeUnlocked()
            resolve(true)
          } else {
            // We can't use await for passworder.decrypt because the error message
            // is not properly thrown, and does not make it to the catch block
            passworder
              .decrypt(password, blob.encrypted_vault)
              .then(async decrypted_data => {
                resolve(await this._setSessionUnlocked(decrypted_data))
              })
              .catch(e => {
                reject(e)
              })
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  // pulled out of unlockVault so session storage interaction can be mocked past
  async _setSessionUnlocked(decrypted_data) {
    return await new Promise((resolve, reject) => {
      chrome.storage.session.set({vault: decrypted_data}, async () => {
        // setup the KeyVault object
        await this.loadVault()

        this._setBadgeUnlocked()
        resolve(true)
      })
    })
  }

  // callers should use this to hydrate this object after the vault has been put in sessionStorage
  async loadVault() {
    // decrypted data should already be in sessionStorage, or it is considered "locked"
    return await new Promise((resolve, reject) => {
      chrome.storage.session.get("vault", res => {
        if (res.vault) {
          var parsedVault = JSON.parse(res.vault)
          Object.keys(parsedVault).forEach(key => {
            var value = parsedVault[key]
            if (value.type == "key-import") {
              this.keyMap.set(key, {rawKey: value.rawKey, type: value.type})
            } else {
              // skip unsupported key types, how'd they get there ???
            }
          })
          this.unlocked = true
          this._setBadgeUnlocked()
          resolve(true) // KeyVault ready for use
        } else {
          this.unlocked = false
          this._setBadgeLocked()
          resolve(false) // the vault has not been loaded from encrypted storage
        }
      })
    })
  }

  // wipe this object and memory, then mark as locked
  async lockVault() {
    await new Promise((resolve, reject) => {
      chrome.storage.session.set({vault: ""}, () => {
        this.keyMap = new Map()
        this.unlocked = false
        this._setBadgeLocked()
        resolve(true)
      })
    })
  }

  // when needed for a signing operation, retrieve the key
  getKey(pubKey) {
    if (!this.unlocked) {
      throw new Error("KeyVault Locked")
    } else if (!this.keyMap.get(pubKey)) {
      throw new Error("Key does not exist in KeyVault")
    }
    return this.keyMap.get(pubKey).rawKey
  }

  // add key to this object, the sessionStorage version, and the localStorage version
  // password is needed to add it to the encrypted storage
  async addKey(pubKey, hexKey, password) {
    if (!this.unlocked) {
      throw new Error("KeyVault Locked")
    }

    var formattedKey = hexKey // get into format we actually want or make sure it is correct already

    // update the KeyVault object
    this.keyMap.set(pubKey, {rawKey: formattedKey, type: "key-import"})
    // update session and local storages
    await this._saveVault(password)
  }

  // save the state of this object for later
  async _saveVault(password) {
    await this._saveVaultToSessionStorage()
    await this._saveVaultToLocalStorage(password)
  }

  // take this object and serialize it into json for session storage for next request to the extension to load from
  async _saveVaultToSessionStorage() {
    await chrome.storage.session.set({vault: this._serialize()})
  }

  // take this object and serialize it into json then encrypt it for local storage for when the browser is restarted
  // do not include password in encrypted storage
  async _saveVaultToLocalStorage(password) {
    await new Promise((resolve, reject) => {
      passworder.encrypt(password, this._serialize()).then(async blob => {
        await chrome.storage.local.set({encrypted_vault: blob})
        resolve(true)
      })
    })
  }

  // helper to turn this object into the JSON format we expect in session and local storage
  _serialize() {
    return JSON.stringify(Object.fromEntries(this.keyMap))
  }

  // helper only to be used in tests
  _reset() {
    keyVault = new KeyVault()
  }

  // don't have a good use for this outside debugging for now
  _listKeys() {
    if (!this.unlocked) {
      throw new Error("KeyVault Locked")
    }

    return this.keyMap
  }

  // making these their own functions so they can be mocked easily
  // TODO: These don't look so great, commenting them out until we
  // can make this look nice
  _setBadgeLocked() {
    chrome.action.setBadgeText({ text: '🔐' })
  }
  _setBadgeUnlocked() {
    chrome.action.setBadgeText({ text: '🔓' })
  }
}

export let KeyVaultClass = KeyVault
export let keyVault = new KeyVault()
