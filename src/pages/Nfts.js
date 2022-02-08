import React, {useEffect, useState} from "react"
import Title from "../components/Title"
import PopupLayout from "../components/PopupLayout"
import {accountManager} from "../lib/AccountManager"
import LoadingSpinner from "../components/LoadingSpinner"
import {Flex} from "@chakra-ui/react"

const NFTs = () => {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])

  useEffect(() => {
    async function getAccount() {
      try {
        setLoading(true)
        const account = await accountManager.getFavoriteAccount()
        setAccount(account)
        const url =
          "https://flow-mainnet.g.alchemy.com/v2/89sw1zoybafxhqayvhjwf6se5yml2y99/getNFTs/?owner=0x9eef2e4511390ce4&offset=0&limit=5"
        let response = await fetch(url)
        const nftsRes = await response.json()
        setData(nftsRes)
        console.log(nftsRes)
      } finally {
        setLoading(false)
      }
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
      {loading ? (
        <Flex direction='row' w='100%' h='100%' align='center' justify='center'>
          <LoadingSpinner />
        </Flex>
      ) : (
        <div>
          {data.nfts.map(nft => {
            return (
              <div key={nft.id.tokenId}>{nft.id.tokenId}</div>
            )
          })}
        </div>
      )}
    </PopupLayout>
  )
}

export default NFTs
