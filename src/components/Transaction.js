import {useTransaction} from "../contexts/TransactionContext"
import {Box} from "@chakra-ui/react"

function Transaction() {
  const {transactionStatus, txId, transactionInProgress} = useTransaction()

  const STATUS_DETAILS = {
    "0": {
      name: "Unknown",
      message: "Waiting for transaction approval.",
      progressIndeterminate: true
    },
    "1": {
      name: "Pending",
      message: "The transaction has been received by a collector but not yet finalized in a block.",
      progressIndeterminate: true,
      progressText: "Executing"
    },
    "2": {
      name: "Finalized",
      message: "The consensus nodes have finalized the block that the transaction is included in.",
      progressValue: 80,
      progressText: "Executing..."
    },
    "3": {
      name: "Executed",
      message: "The execution nodes have produced a result for the transaction.",
      progressValue: 80,
      progressText: "Sealing..."
    },
    "4": {
      name: "Sealed",
      message: "The verification nodes have verified the transaction, and the seal is included in the latest block.",
      progressValue: 100,
      progressText: "Sealed!"
    },
    "5": {
      name: "Expired",
      message: "The transaction was submitted past its expiration block height.",
      hideProgress: true
    }
  }

  if (transactionInProgress && transactionStatus) {
    const statusKey = String(transactionStatus)

    return (
      <Box bg={"gray.700"} rounded={{md: "lg"}} shadow='base' overflow='hidden'>
        <div>
          <span className='txId'>
            <a href={`https://testnet.flowscan.org/transaction/${txId}`}>
              {txId?.slice(0, 8)}
            </a>
          </span>
          <span>
            <kbd>{STATUS_DETAILS[statusKey].name}</kbd>
            <small>
              {" "}
              {STATUS_DETAILS[statusKey].message}
            </small>
          </span>
          {!STATUS_DETAILS[statusKey].hideProgress && 
            <progress indeterminate={STATUS_DETAILS[statusKey].progressIndeterminate} min='0' max='100' value={STATUS_DETAILS[statusKey].progressValue}>
              {STATUS_DETAILS[statusKey].progressText}
            </progress>
          }
        </div>
        <small>
          <a href='https://docs.onflow.org/access-api/'>More info</a>
        </small>
      </Box>
    )
  } else {
    return <span />
  }
}

export default Transaction
