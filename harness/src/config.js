import * as fcl from "@onflow/fcl"
import {send as httpSend} from "@onflow/transport-http"

fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("sdk.transport", httpSend)
  .put("env", "testnet")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
