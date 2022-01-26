import React, {useState, useEffect} from "react"
import {
  Button,
  Text,
  Flex,
  Spacer,
  Box,
  Image,
  Center,
  VStack,
} from "@chakra-ui/react"
import {WalletUtils} from "@onflow/fcl"
import Title from "../../components/Title"
import Layout from "../../components/Layout"
import {accountManager} from "../../lib/AccountManager"
import {useHistory} from "react-router-dom"
import * as styles from "../../styles"
import FlowLogo from "../../assets/flow-logo.png"
import {authnServiceDefinition} from "../../controllers/serviceDefinition"

export default function Authn({location}) {
  const [opener, setOpener] = useState(null)
  const [account, setAccount] = useState(null)
  const history = useHistory()
  const website = "https://flow.com" // need to get from fcl/contentScript

  useEffect(() => {
    /**
     * We can't use "chrome.runtime.sendMessage" for sending messages from React.
     * For sending messages from React we need to specify which tab to send it to.
     */
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: false,
        },
        tabs => {
          /**
           * Sends a single message to the content script(s) in the specified tab,
           * with an optional callback to run when a response is sent back.
           *
           * The runtime.onMessage event is fired in each content script running
           * in the specified tab for the current extension.
           */
          setOpener(tabs[0].id)
          chrome.tabs.sendMessage(tabs[0].id || 0, {type: "FCL:VIEW:READY"})
        }
      )

    const messagesFromReactAppListener = (msg, sender, sendResponse) => {
      if (msg.type === "FCL:VIEW:READY:RESPONSE") {
        console.log(
          "AUTHN page recieved view ready response",
          JSON.parse(JSON.stringify(msg || {}))
        )
      }
    }

    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    chrome.runtime?.onMessage.addListener(messagesFromReactAppListener)
  }, [])

  useEffect(() => {
    async function getAccount() {
      const account = await accountManager.getFavoriteAccount()
      setAccount(account)
    }
    getAccount()
  }, [])

  if (!account) {
    return null
  }

  const address = account ? account.address : ""

  function sendAuthnToFCL() {
    // Since we only allow keys >1000 weight, it doesn't matter which key we select
    const keyId = account.listKeys()[0].id
    const services = authnServiceDefinition(address, keyId)

    chrome.tabs.sendMessage(parseInt(opener), {
      f_type: "AuthnResponse",
      f_vsn: "1.0.0",
      addr: address,
      services: services,
    })
    window.close()
  }

  function sendCancelToFCL() {
    chrome.tabs.sendMessage(parseInt(opener), {type: "FCL:VIEW:CLOSE"})
    window.close()
  }

  return (
    <Layout withGoBack={false}>
      <Title align='center'>Sign In</Title>
      <Box mx='auto' w='280px'>
        <Text mt='32px' fontWeight='bold' fontSize='20px' color={"white"}>
          {website}
        </Text>
        <br />
        <Text fontSize='16px' mt='20px'>
          This app would like to:
        </Text>
        <Flex
          mt='16px'
          p='12px'
          borderTopWidth='3px'
          borderBottomWidth='3px'
          borderColor='gray.500'
        >
          <VStack textAlign='left'>
            <Text
              fontWeight='medium'
              fontSize='16px'
              color='gray.300'
              textAlign='left'
            >
              View your Flow Address
            </Text>
            <Text fontWeight='semibold' fontSize='16px' textAlign='left'>
              {address}
            </Text>
          </VStack>
          <Spacer />
          <Center>
            <Image src={FlowLogo} w={12} h={12} />
          </Center>
        </Flex>
      </Box>
      <Button
        onClick={() =>
          history.push({
            pathname: "/SelectAccount",
            state: {withGoBack: true},
          })
        }
        w='200px'
        mx='auto'
        bg={styles.tertiaryColor}
        mt='18px'
      >
        Switch Account
      </Button>
      <Spacer />
      <Flex>
        <Spacer />
        <Button
          onClick={sendCancelToFCL}
          textAlign='center'
          mt='4'
          bg={styles.tertiaryColor}
          mx='auto'
          mr='16px'
          maxW='150px'
        >
          Cancel
        </Button>
        <Button
          onClick={sendAuthnToFCL}
          textAlign='center'
          mt='4'
          bg={styles.primaryColor}
          mx='auto'
          maxW='150px'
        >
          Confirm
        </Button>
      </Flex>
    </Layout>
  )
}
