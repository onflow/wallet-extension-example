import { keyVault } from "./keyVault";
import { chrome } from 'jest-chrome'
var passworder = require('browser-passworder')

const TEST_PASSWORD = 'TEST_PASSWORD'

beforeEach(() => {
    jest.spyOn(keyVault, '_setBadgeUnlocked').mockImplementation(() => {})
    jest.spyOn(keyVault, '_setBadgeLocked').mockImplementation(() => {})
})

afterEach(() => {
    // since keyVault is a singleton, wipe it clean to start fresh each test
    keyVault._reset();
});

test('constructor', () => {
    var expectedVault = {
        unlocked: false,
        keyMap: new Map()
    }
    expect(keyVault).toMatchObject(expectedVault);
});

test('unlockVault', async () => {
    jest.spyOn(keyVault, 'loadVault').mockImplementation(() => {})

    // store the expected state in localStorage
    chrome.storage.local.get.mockImplementation(
        (message, callback) => {
            // no keys yet
            callback({})
        },
    )

    expect(await keyVault.unlockVault(TEST_PASSWORD)).toBe(true)
    expect(keyVault.unlocked).toBe(true)
})

test('unlockVault with key', async () => {
    jest.spyOn(keyVault, 'loadVault').mockImplementation(() => {})

    // store the expected state in localStorage
    chrome.storage.local.get.mockImplementation(
        (message, callback) => {
            callback({ encrypted_vault: 'encrypted_blob' })
        },
    )
    var sessionSpy = jest.spyOn(keyVault, '_setSessionUnlocked').mockImplementation(() => {
        return true
    })

    const passworderSpy = jest.spyOn(passworder, 'decrypt').mockImplementation(() => {
        return new Promise((resolve, reject) => {
            resolve('encrypted_blob')
        })
    })

    expect(await keyVault.unlockVault(TEST_PASSWORD)).toBe(true)
    expect(keyVault.unlocked).toBe(true)
})

test('loadVault', async () => {
    // TODO: Remove below line once jest-chrome supports session storage
    // This works because session and local have the same API
    chrome.storage.session = chrome.storage.local
    chrome.storage.session.get.mockImplementation(
        (message, callback) => {
            callback({ vault: '{}' })
        },
    )

    expect(keyVault.unlocked).toBe(false)
    await keyVault.loadVault()
    expect(keyVault.unlocked).toBe(true)
})

test('loadVault with key', async () => {
    // TODO: Remove below line once jest-chrome supports session storage
    // This works because session and local have the same API
    chrome.storage.session = chrome.storage.local
    chrome.storage.session.get.mockImplementation(
        (message, callback) => {
            callback({ vault: '{\"0x1\":{\"rawKey\":\"0x123\",\"type\":\"key-import\"}}' })
        },
    )

    expect(keyVault.unlocked).toBe(false)
    await keyVault.loadVault()
    expect(keyVault.unlocked).toBe(true)
    expect(await keyVault.getKey('0x1')).toBe('0x123')
})

test('lockVault', async () => {
    // TODO: Remove below line once jest-chrome supports session storage
    // This works because session and local have the same API
    chrome.storage.session = chrome.storage.local
    chrome.storage.session.set.mockImplementation(
        (message, callback) => {
            callback(message)
        }
    )
    await keyVault.lockVault()
})

test('getKey', async () => {
    await unlockVaultAndAddKey('0x1', '0x123', TEST_PASSWORD)
    expect(keyVault.getKey('0x1')).toBe('0x123')
})

test('addKey', async () => {
    await unlockVaultAndAddKey('0x1', '0x123', TEST_PASSWORD)
    expect(keyVault.getKey('0x1')).toBe('0x123')
})

test('_saveVault', async () => {
    var sessionSpy = jest.spyOn(keyVault, '_saveVaultToSessionStorage').mockImplementation(() => {})
    var localSpy = jest.spyOn(keyVault, '_saveVaultToLocalStorage').mockImplementation(() => {})

    await keyVault._saveVault(TEST_PASSWORD)

    expect(sessionSpy).toBeCalled()
    expect(localSpy).toBeCalledWith(TEST_PASSWORD)
})

test('_saveVaultToSessionStorage', async () => {
    // TODO: Remove below line once jest-chrome supports session storage
    // This works because session and local have the same API
    chrome.storage.session = chrome.storage.local
    // the session.set callback is not used in _saveVaultToSessionStorage
    chrome.storage.session.set.mockImplementation(() => {})

    const sessionSpy = jest.spyOn(chrome.storage.session, 'set');
    const expectedToStore = {
        'vault': keyVault._serialize()
    }

    await keyVault._saveVaultToSessionStorage()
    expect(sessionSpy).toBeCalledWith(expectedToStore)
})

test('_saveVaultToLocalStorage', async () => {
    // the local.set callback is not used in _saveVaultToLocalStorage
    chrome.storage.local.set.mockImplementation(() => {})

    const localSpy = jest.spyOn(chrome.storage.local, 'set');
    const expectedToStore = {
        'encrypted_vault': 'encrypted_blob'
    }
    const passworderSpy = jest.spyOn(passworder, 'encrypt').mockImplementation(() => {
        return new Promise((resolve, reject) => {
            resolve('encrypted_blob')
        })
    })

    await keyVault._saveVaultToLocalStorage()
    expect(localSpy).toBeCalledWith(expectedToStore)
})

test('_serialize', () => {
    const expectedString = '{}'

    expect(keyVault._serialize()).toBe(expectedString)
})

test('_serialize with key', async () => {
    const expectedString = '{\"0x1\":{\"rawKey\":\"0x123\",\"type\":\"key-import\"}}'

    await unlockVaultAndAddKey('0x1', '0x123', TEST_PASSWORD)

    expect(keyVault._serialize()).toBe(expectedString)
})


// helper to deal with unlocking vault and adding a key
async function unlockVaultAndAddKey(pubKey, privKey, password){
    // store the expected state in localStorage
    chrome.storage.local.get.mockImplementation(
        (message, callback) => {
            // no keys yet
            callback({})
        },
    )
    jest.spyOn(keyVault, '_saveVault').mockImplementation(() => {})

    await keyVault.unlockVault(TEST_PASSWORD)
    await keyVault.addKey(pubKey, privKey, password)
}