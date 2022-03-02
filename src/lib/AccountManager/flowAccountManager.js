import FlowAccount from '../flowAccount';
import AccountManager from './accountManager';

export default class FlowAccountManager extends AccountManager {
  constructor(opts = {}) {
    super(opts);
    this.accountMap = new Map();
  }

  async getFavoriteAccount() {
    if (this.favoriteAccount) {
      return this.accountMap.get(this.favoriteAccount);
    } else {
      return null;
    }
  }

  async setFavoriteAccount(address) {
    if (this.accountMap.get(address)) {
      this.favoriteAccount = address;
      await this._saveToLocalStorage();
    } else {
      throw new Error('Account ' + address + ' does not exist');
    }
  }

  async listAccounts() {
    return this.accountMap;
  }

  getAccount(address) {
    return this.accountMap.get(address);
  }

  async importAccount(account) {
    this.accountMap.set(account.address, account);
    await this._saveToLocalStorage();
  }

  async removeAccount(accountAddress) {
    if (this.favoriteAccount === accountAddress) {
      this.favoriteAccount = null;
    }
    this.accountMap.delete(accountAddress);
    await this._saveToLocalStorage();
  }

  async load() {
    return await new Promise((resolve, reject) => {
      chrome.storage.local.get(this._storageKey(), (res) => {
        if (res[this._storageKey()]) {
          var parsedManager = JSON.parse(res[this._storageKey()]);
          // load each account into the manager
          if (parsedManager.accounts) {
            const accounts = parsedManager.accounts;
            Object.keys(accounts).forEach((address) => {
              var accountData = accounts[address];
              var account = new FlowAccount(accountData);
              // load each public key into the account
              Object.keys(accountData.publicKeys).forEach((keyId) => {
                var key = accountData.publicKeys[keyId];
                account.addKey(
                  key.id,
                  key.publicKey,
                  key.weight,
                  key.sigAlg,
                  key.hashAlg
                );
              });
              this.accountMap.set(address, account);
            });
          }
          if (parsedManager.favoriteAccount) {
            this.favoriteAccount = parsedManager.favoriteAccount;
          }
          this.loaded = true;
          resolve(true); // accounts ready for use
        } else {
          // nothing has been saved to disk yet, start fresh
          this.loaded = true;
          resolve(true);
        }
      });
    });
  }

  // take this object and serialize it into json for local storage
  async _saveToLocalStorage() {
    // square brackets around key allows for computed property names
    await chrome.storage.local.set({ [this._storageKey()]: this._serialize() });
  }

  // helper to turn this object into the JSON format we expect in local storage
  // should put account and public keys into a single object for storage
  _serialize() {
    var data = {};
    data['accounts'] = {};
    this.accountMap.forEach((value, key) => {
      data['accounts'][key] = {
        address: value.address,
        balance: value.balance,
        publicKeys: Object.fromEntries(value.publicKeys),
      };
    });
    if (this.favoriteAccount) {
      data['favoriteAccount'] = this.favoriteAccount;
    }
    return JSON.stringify(data);
  }
}
