function serviceDefinition(address, keyId, type, opts) {
  const definition = {
    f_type: 'Service',
    f_vsn: '1.0.0',
    type: type,
    uid: 'uniqueDedupeKey',
    endpoint: 'ext:0x1234',
  };

  if (type === 'authn') {
    definition.id = address;
    definition.identity = {
      address: address,
    };
    definition.provider = {
      f_type: 'ServiceProvider', // Its a Service Provider
      f_vsn: '1.0.0', // Follows the v1.0.0 spec for service providers
      address: '0x1234', // A flow address owned by the wallet
      name: 'Flow Wallet', // OPTIONAL - The name of your wallet. ie: "Dapper Wallet" or "Blocto Wallet"
    };
  }

  if (type === 'authz') {
    definition.method = 'EXT/RPC';
    definition.identity = {
      address: address,
      keyId: Number(keyId),
    };
  }

  /*   if (type === "pre-authz") {
    definition.method = "EXT/RPC"
    definition.data = {
      address: address,
      keyId: Number(keyId),
    }
  } */

  return definition;
}

export function preAuthzServiceDefinition(address, keyId) {
  return {
    f_type: 'PreAuthzResponse',
    f_vsn: '1.0.0',
    proposer: serviceDefinition(address, keyId, 'authz'),
    payer: [serviceDefinition(address, keyId, 'authz')],
    authorization: [serviceDefinition(address, keyId, 'authz')],
  };
}

export function authnServiceDefinition(address, keyId) {
  return [
    serviceDefinition(address, keyId, 'authn'),
    serviceDefinition(address, keyId, 'authz'),
    // serviceDefinition(address, keyId, "pre-authz"),
  ];
}
