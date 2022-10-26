import { mutate } from "@onflow/fcl"
import { yup, nope } from "../util"
import * as fcl from "@onflow/fcl"

export const LABEL = "Mutate 1 (no args)";
export const CMD = async () => {
  // prettier-ignore
  try {
    const response = await mutate({
      cadence: `
        transaction() {
          prepare(acct: AuthAccount) {
            log(acct)
          }
        }
      `,
      limit: 50,
    })

    yup("M-1")(response)

    fcl.tx(response).subscribe((txStatus) => {
      console.log("TX:STATUS", response, txStatus);
    });

    return await fcl.tx(response).onceSealed()
  } catch(e) {
    nope("M-1")(e)
  }
};
