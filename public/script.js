console.log("Inject Script Loaded")

document.addEventListener("EXT:DETAIL", function (e) {
  window.ext_id = e.detail.id
  console.log("INJECTED SCRIPT EVENT", e.detail.id)
  buildAuthnService(e.detail.id)
})

function buildAuthnService(id) {
  const AuthnService = {
    f_type: "Service",
    f_vsn: "1.0.0",
    type: "authn",
    uid: `${id}#authn`,
    endpoint: `chrome-extension://${id}/index.html#/authn`,
    method: "EXT/RPC",
    id: `${id}`,
    identity: {
      address: "0x1234",
    },
    provider: {
      address: "0x1234",
      name: "Flow Wallet",
      icon: null,
      description: "Flow Non-Custodial Wallet Extension for Chrome",
    },
  }
  if (!Array.isArray(window.fcl_extensions)) {
    window.fcl_extensions = []
  }

  window.fcl_extensions.push(AuthnService)
}
