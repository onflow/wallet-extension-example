import FlowPubKey from './flowPubKey';

export default class FlowAccount {
  constructor(opts = {}) {
    this.address = opts.address;
    this.balance = opts.balance;
    this.publicKeys = new Map(); // keyID to flowPubKey
  }

  addKey(id, hexKey, weight, sigAlg, hashAlg) {
    // what kind of validations are needed here?
    // should we check no other key has this ID before adding?
    var key = new FlowPubKey({
      id: id,
      publicKey: hexKey,
      weight: weight,
      sigAlg: sigAlg,
      hashAlg: hashAlg,
    });

    this.publicKeys.set(key.id, key);
    return key;
  }

  removeKey(id) {
    var toRemove = this.getKey(id);

    this.publicKeys.delete(id);

    return toRemove;
  }

  getKey(keyId) {
    return this.publicKeys.get(keyId.toString());
  }

  listKeys() {
    var valueIterator = this.publicKeys.values();
    var list = [];
    var keys = valueIterator.next();
    while (!keys.done) {
      list.push(keys.value);
      keys = valueIterator.next();
    }
    return list;
  }

  _serialize() {
    var data = {
      address: this.address,
      balance: this.balance,
      publicKeys: Object.fromEntries(this.publicKeys),
    };
    return JSON.stringify(data);
  }
}
