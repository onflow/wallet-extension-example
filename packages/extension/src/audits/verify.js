import * as fcl from "@onflow/fcl"

export const verify = async (template, audit) => {

    return fcl.InteractionTemplateUtils.verifyInteractionTemplateAudit({
      template,
      audit,
    })

    if (!template) return false
    if (!audit) return false

    let msg = template?.id
    
    if (!(msg === audit.data.id)) return false

    let address = audit?.data?.signer?.address
    let key_id = audit?.data?.signer?.key_id
    let signature = audit?.data?.signer?.signature

    let isVerified = false
    try {
        isVerified = await fcl.query({
          cadence: `
          pub fun main(
            address: Address,
            message: String,
            keyIndex: Int,
            signature: String,
            domainSeparationTag: String,
          ): Bool {
            let account = getAccount(address)
  
            let accountKey = account.keys.get(keyIndex: keyIndex) ?? panic("Key provided does not exist on account")
            
            let messageBytes = message.decodeHex()
            let sigBytes = signature.decodeHex()
  
            // Ensure the key is not revoked
            if accountKey.isRevoked {
                return false
            }
  
            // Ensure the signature is valid
            return accountKey.publicKey.verify(
                signature: sigBytes,
                signedData: messageBytes,
                domainSeparationTag: domainSeparationTag,
                hashAlgorithm: accountKey.hashAlgorithm
            )
          }
          `,
          args: (arg, t) => ([
            arg(address, t.Address),
            arg(msg, t.String),
            arg(String(key_id), t.Int),
            arg(signature, t.String),
            arg("FLOW-V0.0-user", t.String),
          ])
        })
    } catch(e) {}

    return isVerified
} 