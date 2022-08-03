import * as fcl from "@onflow/fcl"

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("flow.network", "testnet")
  .put("env", "testnet")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("logger.level", 5)
