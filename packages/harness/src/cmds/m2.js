import {mutate} from "@onflow/fcl"
import {yup, nope} from "../util"
import * as fcl from "@onflow/fcl"

export const LABEL = "Mutate 2 (args)"
export const CMD = async () => {
  // prettier-ignore

  try {
    const response = await mutate({
      cadence: `
        transaction(a: Int, b: Int, c: Address) {
          prepare(acct: AuthAccount) {
            log(acct)
            log(a)
            log(b)
            log(c)
          }
        }
      `,
      args: (arg, t) => [
        arg(6, t.Int),
        arg(7, t.Int),
        arg("0xba1132bc08f82fe2", t.Address),
      ],
      limit: 50,
    })

    yup("M-2")(response)

    fcl.tx(response).subscribe((txStatus) => {
      console.log("TX:STATUS", response, txStatus);
    });

    return await fcl.tx(response).onceSealed()
  } catch(e) {
    nope("M-2")(e)
  }
}
