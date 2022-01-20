import FlowAccount from "./flowAccount"
import FlowPubKey from "./flowPubKey";

test('constructor', () => {
    var expectedAccount = {
        address: '0x1',
        balance: 0,
        publicKeys: new Map()
    };

    var emptyAccount = new FlowAccount({
        address: '0x1',
        balance: 0
    });
    expect(emptyAccount).toMatchObject(expectedAccount);
});

test('addKey', () => {
    var expectedKey = new FlowPubKey({
        id: '0x1',
        publicKey: '0x123',
        weight: 1000,
        sigAlg: 'testSigAlg',
        hashAlg: 'testHashAlg'
    });

    var testAccount = new FlowAccount({
        address: '0x1',
        balance: 0
    });

    testAccount.addKey(expectedKey.id, expectedKey.publicKey, expectedKey.weight, expectedKey.sigAlg, expectedKey.hashAlg)
    expect(testAccount.publicKeys.get('0x1')).toStrictEqual(expectedKey);
});

test('removeKey', () => {
    var expectedKey = new FlowPubKey({
        id: '0x1',
        publicKey: '0x123',
        weight: 1000,
        sigAlg: 'testSigAlg',
        hashAlg: 'testHashAlg'
    });

    var testAccount = new FlowAccount({
        address: '0x1',
        balance: 0
    });

    testAccount.addKey(expectedKey.id, expectedKey.publicKey, expectedKey.weight, expectedKey.sigAlg, expectedKey.hashAlg)
    // first make sure the key was successfully added
    expect(testAccount.publicKeys.get('0x1')).toStrictEqual(expectedKey);
    // then delete
    expect(testAccount.removeKey(expectedKey.id)).toStrictEqual(expectedKey);
    expect(testAccount.publicKeys.get('0x1')).toBeUndefined;
});

test('getKey', () => {
    var expectedKey = new FlowPubKey({
        id: '0x1',
        publicKey: '0x123',
        weight: 1000,
        sigAlg: 'testSigAlg',
        hashAlg: 'testHashAlg'
    });

    var testAccount = new FlowAccount({
        address: '0x1',
        balance: 0
    });

    testAccount.addKey(expectedKey.id, expectedKey.publicKey, expectedKey.weight, expectedKey.sigAlg, expectedKey.hashAlg)
    expect(testAccount.getKey('0x1')).toStrictEqual(expectedKey);
})

test('listKeys', () => {
    var firstKey = new FlowPubKey({
        id: '0x1',
        publicKey: '0x123',
        weight: 1000,
        sigAlg: 'testSigAlg',
        hashAlg: 'testHashAlg'
    });
    var secondKey = new FlowPubKey({
        id: '0x2',
        publicKey: '0x789',
        weight: 500,
        sigAlg: 'testSigAlg',
        hashAlg: 'testHashAlg'
    });
    var expectedList = [firstKey, secondKey]

    var testAccount = new FlowAccount({
        address: '0x1',
        balance: 0
    });

    testAccount.addKey(firstKey.id, firstKey.publicKey, firstKey.weight, firstKey.sigAlg, firstKey.hashAlg)
    testAccount.addKey(secondKey.id, secondKey.publicKey, secondKey.weight, secondKey.sigAlg, secondKey.hashAlg)

    expect(testAccount.listKeys()).toStrictEqual(expectedList)
})

test('_serialize', () => {
    var expectedString = '{\"address\":\"0x1\",\"balance\":0,\"publicKeys\":{}}'

    var testAccount = new FlowAccount({
        address: '0x1',
        balance: 0
    });

    expect(testAccount._serialize()).toStrictEqual(expectedString)
})

test('_serialize with key', () => {
    var expectedString = '{\"address\":\"0x1\",\"balance\":0,\"publicKeys\":{\"0x1\":{\"id\":\"0x1\",\"publicKey\":\"0x123\",\"sigAlg\":\"testSigAlg\",\"hashAlg\":\"testHashAlg\",\"weight\":1000}}}'

    var testAccount = new FlowAccount({
        address: '0x1',
        balance: 0
    });
    var firstKey = new FlowPubKey({
        id: '0x1',
        publicKey: '0x123',
        weight: 1000,
        sigAlg: 'testSigAlg',
        hashAlg: 'testHashAlg'
    });
    testAccount.addKey(firstKey.id, firstKey.publicKey, firstKey.weight, firstKey.sigAlg, firstKey.hashAlg)

    expect(testAccount._serialize()).toStrictEqual(expectedString)
})

