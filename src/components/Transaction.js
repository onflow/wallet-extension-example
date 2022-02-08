import {useTransaction} from "../contexts/TransactionContext"
import {Box, Text, Button} from "@chakra-ui/react"
import * as styles from "../styles"

function Transaction() {
  const {transactionStatus, txId, transactionInProgress} = useTransaction()

  const STATUS_DETAILS = {
    "0": {
      name: "Unknown",
      message: "We are sending your transaction to the chain. One second while we get a response.",
      progressIndeterminate: true,
      progressText: "Waiting..."
    },
    "1": {
      name: "Pending",
      message: "The transaction has been received by a collector but not yet finalized in a block.",
      progressIndeterminate: true,
      progressText: "Executing..."
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
      hideProgress: true,
      progressText: "Sealed!"
    },
    "5": {
      name: "Expired",
      message: "The transaction was submitted past its expiration block height.",
      hideProgress: true
    }
  }

  if (transactionInProgress) {
    const statusKey = transactionStatus ?  String(transactionStatus) : "0"

    return (
      <Box p='6' bg={"gray.700"} borderWidth='1px' borderRadius='lg'>
        <Box>
          <span className='txId'>
            <a href={`https://testnet.flowscan.org/transaction/${txId}`}>
             <Text as='em'>Tx ID:</Text> <Text as='u'>{txId?.slice(0, 8)}</Text>
            </a>
          </span>
          <Text fontSize='lg' mt={3}><strong>{STATUS_DETAILS[statusKey].name}</strong></Text>
          <Text as='i'>{STATUS_DETAILS[statusKey].message}</Text>
          {!STATUS_DETAILS[statusKey].hideProgress && 
            <Box mb={3}>
              <progress indeterminate={STATUS_DETAILS[statusKey].progressIndeterminate} min='0' max='100' value={STATUS_DETAILS[statusKey].progressValue}>
                {STATUS_DETAILS[statusKey].progressText}
              </progress>
            </Box>
          }
          <div>
            <Text as='u'>
              <a
                href={`https://testnet.flowscan.org/transaction/${txId}`}
                target='_blank'
                and
                rel='noopener noreferrer'
              >
                View Transaction Details
              </a>
            </Text>
          </div>
        </Box>
        <Button
          onClick={() => window.close()}
          textAlign='center'
          mt='4'
          bg={styles.tertiaryColor}
          mx='auto'
          mr='16px'
          maxW='150px'
        >
          Close
        </Button>
      </Box>
    )
  } else {
    return <div />
  }
}

export default Transaction
