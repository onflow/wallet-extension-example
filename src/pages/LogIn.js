import React, {useState} from "react"
import {Img, Button} from "@chakra-ui/react"
import FlowWalletImg from "../assets/flow-logo.png"
import * as styles from "../styles"
import {useHistory} from "react-router-dom"
import Title from "../components/Title"
import {accountManager} from "../lib/AccountManager"
import {keyVault} from "../lib/keyVault"
import {useToast} from "@chakra-ui/toast"
import Layout from "../components/Layout"
import SubmitInput from "../components/SubmitInput"

const FirstTime = ({location}) => {
  const [password, setPassword] = useState("")

  const history = useHistory()
  const toast = useToast()

  const submitPassword = async () => {
    try {
      await keyVault.unlockVault(password)
      const address = await accountManager.getFavoriteAccount()
      if (address) {
        history.push({
          pathname: "/Balances",
        })
      } else {
        history.push({
          pathname: "/SelectAccount",
        })
      }
    } catch (e) {
      toast({
        description: "Invalid password",
        status: "error",
        duration: styles.toastDuration,
        isClosable: true,
      })
    }
  }

  return (
    <Layout
      withGoBack={location && location.state && location.state.withGoBack}
    >
      <Img src={FlowWalletImg} />
      <Title mt='20px'>Unlock Wallet</Title>
      <SubmitInput
        mt='20px'
        type='password'
        placeholder='Enter Password'
        maxW='200px'
        mx='auto'
        value={password}
        onChange={e => {
          setPassword(e.target.value)
        }}
        onEnter={submitPassword}
      />
      <Button
        bg={styles.primaryColor}
        onClick={submitPassword}
        maxW='200px'
        mt='32px'
        mx='auto'
      >
        Continue
      </Button>
    </Layout>
  )
}

export default FirstTime
