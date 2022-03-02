import FlowPubKey from './flowPubKey';

test('constructor', () => {
  var expectedKey = {
    id: '0x1',
    publicKey: '0x123',
    sigAlg: 'testSigAlg',
    hashAlg: 'testHashAlg',
    weight: 1000,
  };

  var key = new FlowPubKey({
    id: expectedKey.id,
    publicKey: expectedKey.publicKey,
    sigAlg: expectedKey.sigAlg,
    hashAlg: expectedKey.hashAlg,
    weight: expectedKey.weight,
  });
  expect(key).toMatchObject(key);
});

test('constructor with invalid weight', () => {
  expect(() => {
    new FlowPubKey({
      id: '0x1',
      publicKey: '0x123',
      sigAlg: 'testSigAlg',
      hashAlg: 'testHashAlg',
      weight: 0,
    });
  }).toThrow(new Error('FlowPubKey weight must be an integer between 1-1000'));
});

test('updateWeight', () => {
  var key = new FlowPubKey({
    id: '0x1',
    publicKey: '0x123',
    sigAlg: 'testSigAlg',
    hashAlg: 'testHashAlg',
    weight: 1000,
  });

  expect(key.weight).toBe(1000);
  key.updateWeight(500);
  expect(key.weight).toBe(500);
});

test('updateWeight invalid weight', () => {
  var key = new FlowPubKey({
    id: '0x1',
    publicKey: '0x123',
    sigAlg: 'testSigAlg',
    hashAlg: 'testHashAlg',
    weight: 1000,
  });

  expect(() => {
    key.updateWeight(9999);
  }).toThrow(new Error('FlowPubKey weight must be an integer between 1-1000'));
});

test('_seralize', () => {
  var expectedString =
    '{"id":"0x1","publicKey":"0x123","sigAlg":"testSigAlg","hashAlg":"testHashAlg","weight":1000}';

  var key = new FlowPubKey({
    id: '0x1',
    publicKey: '0x123',
    sigAlg: 'testSigAlg',
    hashAlg: 'testHashAlg',
    weight: 1000,
  });

  expect(key._serialize()).toStrictEqual(expectedString);
});
