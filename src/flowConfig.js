import { config } from '@onflow/fcl';
import { send as httpSend } from '@onflow/transport-http';

const configs = {
  flow_mainnet: {
    accessNode: 'https://access-mainnet-beta.onflow.org',
  },
  flow_testnet: {
    accessNode: 'https://rest-testnet.onflow.org',
  },
};

const configureFcl = (network = 'flow_testnet') => {
  const fclConfig = config();
  fclConfig.put('accessNode.api', configs[network].accessNode);
  fclConfig.put('sdk.transport', httpSend);
};

export default configureFcl;
