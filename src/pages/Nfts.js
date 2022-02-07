import React, {useEffect, useState} from "react"
import Title from "../components/Title"
import PopupLayout from "../components/PopupLayout"
import {accountManager} from "../lib/AccountManager"

const NFTs = () => {
  const [account, setAccount] = useState(null)
  useEffect(() => {
    async function getAccount() {
      const account = await accountManager.getFavoriteAccount()
      setAccount(account)
      const url =
        "https://flow-mainnet.g.alchemy.com/v2/89sw1zoybafxhqayvhjwf6se5yml2y99/getNFTs/?owner=0x9eef2e4511390ce4&offset=0&limit=5"
      let response = await fetch(url)
      const nfts = await response.json()
      console.log(nfts)
    }
    getAccount()
  }, [])

  if (!account) {
    return null
  }

  const address = account ? account.address : ""

  return (
    <PopupLayout selectedPage='nfts'>
      <Title align='left'>NFTs for {address}</Title>
    </PopupLayout>
  )
}

export default NFTs
