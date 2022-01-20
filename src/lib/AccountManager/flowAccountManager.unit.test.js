import FlowAccountManager from "./flowAccountManager";
import { chrome } from 'jest-chrome'
import FlowAccount from "../flowAccount"

let flowAccountManager = new FlowAccountManager({
    accountStoragePrefix: 'flow_mainnet',
    accountNetwork: "Flow Mainnet"
})

afterEach(() => {
    // start each test with a clean account manager
    flowAccountManager = new FlowAccountManager({
        accountStoragePrefix: 'flow_mainnet',
        accountNetwork: "Flow Mainnet"
    })
});

test('constructor', () => {
    const expectedManager = {
        accountStoragePrefix: 'flow_mainnet',
        accountNetwork: "Flow Mainnet",
        favoriteAccount: null,
        loaded: false,
        accountMap: new Map()
    }
    expect(flowAccountManager).toMatchObject(expectedManager);
});

test('getFavoriteAccount', async () => {
    const favoriteAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    await flowAccountManager.importAccount(favoriteAccount)
    await flowAccountManager.setFavoriteAccount(favoriteAccount.address)
    expect(await flowAccountManager.getFavoriteAccount()).toBe(favoriteAccount)
})

test('setFavoriteAccount', async () => {
    const favoriteAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    await flowAccountManager.importAccount(favoriteAccount)
    await flowAccountManager.setFavoriteAccount(favoriteAccount.address)
    expect(await flowAccountManager.getFavoriteAccount()).toBe(favoriteAccount)
})

test('setFavoriteAccount missing account', async () => {
    await expect(flowAccountManager.setFavoriteAccount('0x1'))
    .rejects.toThrowError(new Error('Account 0x1 does not exist'));
})

test('listAccounts', async () => {
    const testAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    await flowAccountManager.importAccount(testAccount)
    const expectedMap = new Map()
    expectedMap.set(testAccount.address, testAccount)

    expect(await flowAccountManager.listAccounts()).toStrictEqual(expectedMap)
})

test('importAccount', async () => {
    const testAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    await flowAccountManager.importAccount(testAccount)
    const expectedMap = new Map()
    expectedMap.set(testAccount.address, testAccount)

    expect(await flowAccountManager.listAccounts()).toStrictEqual(expectedMap)
})

test('removeAccount', async () => {
    const testAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    await flowAccountManager.importAccount(testAccount)
    const expectedMap = new Map()
    expectedMap.set(testAccount.address, testAccount)

    // first check account is present
    expect(await flowAccountManager.listAccounts()).toStrictEqual(expectedMap)

    await flowAccountManager.removeAccount(testAccount.address)
    // then make sure it was removed
    expect(await flowAccountManager.listAccounts()).toStrictEqual(new Map())
})

test('load', async () => {
    // set up expected manager state
    const testAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    testAccount.addKey('0x1', '0x123', 1000, 'testSigAlg', 'testHashAlg')
    const expectedMap = new Map()
    expectedMap.set(testAccount.address, testAccount)
    await flowAccountManager.importAccount(testAccount)
    await flowAccountManager.setFavoriteAccount(testAccount.address)

    // store the expected state in localStorage
    const storageState = flowAccountManager._serialize()
    chrome.storage.local.get.mockImplementation(
        (message, callback) => {
            callback({ flow_mainnet_account_manager: storageState })
        },
    )

    // make sure we are going to have to load the state the localStorage
    flowAccountManager = new FlowAccountManager({
        accountStoragePrefix: 'flow_mainnet',
        accountNetwork: "Flow Mainnet"
    })
    expect(await flowAccountManager.getFavoriteAccount()).toBe(null)

    // read from local storage
    // the function we are testing
    await flowAccountManager.load()

    // validate all the data in the object is as expected
    expect(await flowAccountManager.getFavoriteAccount()).toStrictEqual(testAccount)
    expect(await flowAccountManager.listAccounts()).toStrictEqual(expectedMap)
})

test('_saveToLocalStorage', async () => {
    const spy = jest.spyOn(chrome.storage.local, 'set');
    const expectedToStore = {
        'flow_mainnet_account_manager': flowAccountManager._serialize()
    }

    await flowAccountManager._saveToLocalStorage()
    expect(spy).toBeCalledWith(expectedToStore)
})

test('_serialize', () => {
    const expectedString = '{\"accounts\":{}}'

    expect(flowAccountManager._serialize()).toBe(expectedString)
})

test('_serialize with account', () => {
    const expectedString = '{\"accounts\":{\"0x1\":{\"address\":\"0x1\",\"balance\":100,\"publicKeys\":{}}}}'

    const testAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    flowAccountManager.importAccount(testAccount)

    expect(flowAccountManager._serialize()).toBe(expectedString)
})

test('_serialize with account with key', () => {
    const expectedString = '{\"accounts\":{\"0x1\":{\"address\":\"0x1\",\"balance\":100,\"publicKeys\":{\"0x1\":{\"id\":\"0x1\",\"publicKey\":\"0x123\",\"sigAlg\":\"testSigAlg\",\"hashAlg\":\"testHashAlg\",\"weight\":1000}}}}}'

    var testAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    testAccount.addKey('0x1', '0x123', 1000, 'testSigAlg', 'testHashAlg')
    flowAccountManager.importAccount(testAccount)

    expect(flowAccountManager._serialize()).toBe(expectedString)
})

test('_seralize with favorite', () => {
    const expectedString = '{\"accounts\":{\"0x1\":{\"address\":\"0x1\",\"balance\":100,\"publicKeys\":{}}},\"favoriteAccount\":\"0x1\"}'

    const favoriteAccount = new FlowAccount({
        address: '0x1',
        balance: 100
    })
    flowAccountManager.importAccount(favoriteAccount)
    flowAccountManager.setFavoriteAccount(favoriteAccount.address)

    expect(flowAccountManager._serialize()).toBe(expectedString)
})