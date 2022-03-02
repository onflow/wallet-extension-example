import { sign } from './signatures';
import { keyVault } from '../lib/keyVault';
import { accountManager } from '../lib/AccountManager';
import * as fcl from '@onflow/fcl';

export async function createSignature(signable, address, keyID) {
  address = fcl.withPrefix(address);
  const account = accountManager.getAccount(address);
  const key = account.getKey(keyID);
  const privKey = keyVault.getKey(key.publicKey);
  return await sign(account, keyID, privKey, signable);
}
