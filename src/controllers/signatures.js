import {ec as EC} from "elliptic"
import {SHA3} from "sha3"
import forge from "node-forge"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
var Buffer = require("buffer/").Buffer
const p256 = new EC("p256")
const secp256 = new EC("secp256k1")
const ecdsa = new EC("ed25519")

// Takes in a msg that is already in hex form, and a
// hashAlg in flow's key format for hash algorithms
// Return binary digest
const hashMsgHex = (msgHex, hashAlg) => {
  if (hashAlg === 3) {
    const sha = new SHA3(256)
    sha.update(Buffer.from(msgHex, "hex"))
    return sha.digest()
  } else if (hashAlg === 1) {
    const md = forge.md.sha256.create()
    md.update(Buffer.from(msgHex, "hex"))
    return md.digest()
  } else {
    throw new Error("Unsupported hash alg provided")
  }
}

export const sign = async (account, keyID, privateKey, msgHex) => {
  const pubKey = account.getKey(keyID)

  const ec = pubKey.sigAlg === 2 ? p256 : pubKey.sigAlg === 3 ? secp256 : ecdsa

  // We store keys in HEX - so, this privateKey arg
  // is expected to be in hex already
  const key = ec.keyFromPrivate(privateKey)

  console.log("HEX vs EC privKey", privateKey, key)
  
  const sig = key.sign(hashMsgHex(msgHex, pubKey.hashAlg))
  const n = 32
  const r = sig.r.toArrayLike(Buffer, "be", n)
  const s = sig.s.toArrayLike(Buffer, "be", n)
  return Buffer.concat([r, s]).toString("hex")
}

export const verifyUserSignature = async (
  rawPublicKey,
  weight,
  signature,
  signedData
) => {
  console.log("verify", rawPublicKey, weight, signature, signedData)
  // TODO: This cadence code should come from a cadence-to-json generated package
  // dedicated to this wallet and all cadence needed for it.
  const CODE = `
    import Crypto

    pub fun main(rawPublicKeys: [String], weights: [UFix64], signatures: [String], signedData: String): Bool {
      let keyList = Crypto.KeyList()
      var i = 0
      for rawPublicKey in rawPublicKeys {
        keyList.add(
          PublicKey(
            publicKey: rawPublicKey.decodeHex(),
            signatureAlgorithm: SignatureAlgorithm.ECDSA_P256 // or SignatureAlgorithm.ECDSA_Secp256k1
          ),
          hashAlgorithm: HashAlgorithm.SHA3_256,
          weight: weights[i],
        )
        i = i + 1
      }
    
      let signatureSet: [Crypto.KeyListSignature] = []
      var j = 0
      for signature in signatures {
        signatureSet.append(
          Crypto.KeyListSignature(
            keyIndex: j,
            signature: signature.decodeHex()
          )
        )
        j = j + 1
      }
    
      return keyList.verify(
        signatureSet: signatureSet,
        signedData: signedData.decodeHex(),
      )
    }
    `

  let result
  try {
    result = await fcl
      .send([
        fcl.script(CODE),
        fcl.args([
          fcl.arg([rawPublicKey.toString()], t.Array(t.String)),
          fcl.arg([weight.toFixed(1).toString()], t.Array(t.UFix64)),
          fcl.arg([signature.toString()], t.Array(t.String)),
          fcl.arg(signedData.toString(), t.String),
        ]),
        fcl.limit(9999),
      ])
      .then(fcl.decode)
  } catch (e) {
    console.error(e)
    throw new Error("Poorly formed private key entered")
  }
  return result
}
