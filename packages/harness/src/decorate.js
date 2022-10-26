import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

window.fcl = fcl;
window.t = t;

window.addEventListener("FLOW::TX", (d) => {
  console.log("FLOW::TX", d.detail.delta, d.detail.txId);
});

window.addEventListener("message", (d) => {
  console.log("Harness Message Received", d.data);
});
