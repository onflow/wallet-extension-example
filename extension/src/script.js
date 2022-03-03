import { WalletUtils } from "@onflow/fcl";

const service = {
  f_type: "Service",
  f_vsn: "1.0.0",
  type: "authn",
  uid: "uniqueDedupeKey",
  endpoint: "ext:0x1234",
  method: "EXT/RPC",
  id: "xxxxxxxx-xxxx",
  identity: {
    address: "0x1234",
  },
  provider: {
    address: "0x1234",
    name: "Flow Wallet",
    icon: null,
    description: "Flow Non-Custodial Wallet Extension for Chrome",
  },
};

WalletUtils.injectExtService(service);
