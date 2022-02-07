import {createContext, useContext, useState} from "react"

// https://docs.onflow.org/fcl/reference/api/#transaction-statuses

export const TransactionContext = createContext({})

export const useTransaction = () => useContext(TransactionContext)

export default function TransactionProvider({children}) {
  const [transactionInProgress, setTransactionInProgress] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState()
  const [txId, setTxId] = useState("")

  function initTransactionState() {
    setTransactionInProgress(true)
    setTransactionStatus(null)
  }

  const value = {
    transactionInProgress,
    transactionStatus,
    txId,
    initTransactionState,
    setTxId,
    setTransactionStatus,
  }

  console.log("TransactionProvider", value)

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}
