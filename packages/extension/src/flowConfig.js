import { config } from "@onflow/fcl";

const configs = {
  flow_mainnet: {
    accessNode: "https://rest-mainnet.onflow.org",
    flowNetwork: "mainnet",
  },
  flow_testnet: {
    accessNode: "https://rest-testnet.onflow.org",
    flowNetwork: "testnet",
  },
};

const configureFcl = (network = "flow_testnet") => {
  const fclConfig = config();
  fclConfig.put("accessNode.api", configs[network].accessNode);
  fclConfig.put("flow.network", configs[network].flowNetwork);
  fclConfig.put("logger.level", 5);
};

export default configureFcl;
