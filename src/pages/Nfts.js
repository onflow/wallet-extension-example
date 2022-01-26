import React, {useEffect, useState} from "react"
import Title from "../components/Title"
import PopupLayout from "../components/PopupLayout"
import {accountManager} from "../lib/AccountManager"

const NFTs = ({}) => {
  const [account, setAccount] = useState(null)
  useEffect(() => {
    async function getAccount() {
      const account = await accountManager.getFavoriteAccount()
      console.log("get account", account)
      setAccount(account)
    }
    getAccount()
  }, [])

  if (!account) {
    return null
  }

  const address = account ? account.address : ""

  return (
    <PopupLayout selectedPage='nfts'>
      <Title align='left'>NFTs</Title>
    </PopupLayout>
  )
}

export default NFTs
