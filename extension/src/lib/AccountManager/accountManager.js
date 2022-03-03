export default class AccountManager {
  constructor(opts = {}) {
    // Allows for multiple partitions of account managers prefixed by some standard
    this.accountStoragePrefix = opts.accountStoragePrefix || "FLOW";
    this.favoriteAccount = opts.favoriteAccount || null;
    this.accountNetwork = opts.accountNetwork;
    // each manager will set this to true after it has loaded into the object
    this.loaded = false;
  }

  async getFavoriteAccount() {
    throw new Error("Method getSelectedAccount must be implemented");
  }

  async favoriteAccount() {
    throw new Error("Method selectAccount must be implemented");
  }

  async listAccounts() {
    throw new Error("Method listAccounts must be implemented");
  }

  async importAccount() {
    throw new Error("Method importAccount must be implemented");
  }

  async removeAccount() {
    throw new Error("Method removeAccount must be implemented");
  }

  _storageKey() {
    return this.accountStoragePrefix + "_account_manager";
  }

  // each manager should have a way to load in from storage
  async load() {
    throw new Error("Method load must be implemented");
  }
}
