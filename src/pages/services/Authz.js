import React, {useState, useEffect} from "react"
import {
  Input,
  Button,
  Box,
  Text,
  VStack,
  Center,
  Textarea,
} from "@chakra-ui/react"
import {WalletUtils} from "@onflow/fcl"
import Layout from "../../components/Layout"
import Title from "../../components/Title"
import {keyVault} from "../../lib/keyVault"
import * as styles from "../../styles"
import {useToast} from "@chakra-ui/toast"
import {Flex, Spacer} from "@chakra-ui/layout"
import {createSignature} from "../../controllers/authz"

export default function Authz() {
  const [opener, setOpener] = useState(null)
  const [signable, setSignable] = useState(null)
  const [unlocked, setUnlocked] = useState(keyVault.unlocked)
  const [transactionCode, setTransactionCode] = useState(``)
  const [showTransactionCode, setShowTransactionCode] = useState(false)
  const [description, setDescription] = useState(
    "This transaction has not been audited."
  )
  const [password, setPassword] = useState(null)
  const [loading, setLoading] = useState("")

  const toast = useToast()

  const website = "https://flow.com" // need to get from fcl/contentScript

  function fclCallback(data) {
    if (typeof data != "object") return
    if (data.type !== "FCL:VIEW:READY:RESPONSE") return
    const signable = data.body
    if (signable.cadence) {
      setTransactionCode(signable.cadence)
    }
    setSignable(signable)
  }

  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: false,
        },
        tabs => {
          setOpener(tabs[0].id)
          chrome.tabs.sendMessage(tabs[0].id || 0, {type: "FCL:VIEW:READY"})
        }
      )

    const messagesFromReactAppListener = (msg, sender, sendResponse) => {
      if (msg.type === "FCL:VIEW:READY:RESPONSE") {
        console.log(
          "AUTHZ page recieved view ready response",
          JSON.parse(JSON.stringify(msg || {}))
        )
        fclCallback(JSON.parse(JSON.stringify(msg || {})))
      }
    }

    chrome.runtime?.onMessage.addListener(messagesFromReactAppListener)
  }, [])

  async function submitPassword() {
    setLoading(true)
    try {
      await keyVault.unlockVault(password)
      setUnlocked(true)
    } catch (e) {
      toast({
        description: "Invalid password",
        status: "error",
        duration: styles.toastDuration,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  async function sendAuthzToFCL() {
    setLoading(true)
    const signedMessage = await createSignature(
      signable.message,
      signable.addr,
      signable.keyId
    )

    chrome.tabs.sendMessage(parseInt(opener), {
      f_type: "PollingResponse",
      f_vsn: "1.0.0",
      status: "APPROVED",
      reason: null,
      data: new WalletUtils.CompositeSignature(
        signable.addr,
        signable.keyId,
        signedMessage
      ),
    })
    setLoading(false)
    window.close()
  }

  function sendCancelToFCL() {
    chrome.tabs.sendMessage(parseInt(opener), {type: "FCL:VIEW:CLOSE"})
    window.close()
  }

  return (
    <Layout withGoBack={false}>
      {!unlocked ? (
        <>
          <Title>Unlock your wallet to confirm the transaction</Title>
          <Flex>
            <Spacer />
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              mx='auto'
              maxW='220px'
              p='2'
              mt='24'
              placeholder='Password'
            ></Input>
            <Spacer />
          </Flex>

          <Flex>
            <Spacer />
            <Button
              onClick={submitPassword}
              textAlign='center'
              mt='4'
              bg={styles.primaryColor}
              color={styles.whiteColor}
              mx='auto'
              maxW='150px'
            >
              Continue
            </Button>
            <Spacer />
          </Flex>
        </>
      ) : (
        <>
          <Title align='center'>Confirm Transaction</Title>
          <Box mx='auto' w='280px'>
            <Text mt='32px' fontWeight='bold' fontSize='20px' color={"white"}>
              {website}
            </Text>
            <br />
            <Text fontSize='18px' mt='12px'>
              Estimated Fees
            </Text>
            <VStack
              mt='8px'
              p='12px'
              borderTopWidth='3px'
              borderBottomWidth='3px'
              borderColor='gray.500'
            >
              <Center>
                <Text
                  align='center'
                  color='gray.100'
                  textAlign='center'
                  fontWeight='medium'
                  fontSize='16px'
                >
                  Flow ₣0.0001
                </Text>
              </Center>
            </VStack>
            <br />
            <Text fontSize='18px' mt='12px'>
              Transaction
            </Text>
            <Text> {description} </Text>
            <VStack
              mt='4px'
              p='12px'
              borderTopWidth='3px'
              borderBottomWidth='3px'
              borderColor='gray.500'
            >
              <Center>
                <Text
                  align='center'
                  color='gray.100'
                  textAlign='center'
                  fontWeight='medium'
                  fontSize='16px'
                  textDecoration='underline'
                  cursor='pointer'
                  onClick={() => {
                    setShowTransactionCode(!showTransactionCode)
                  }}
                >
                  {!showTransactionCode
                    ? `View Transaction Code`
                    : `Hide Transaction Code`}
                </Text>
              </Center>
              {showTransactionCode ? (
                <>
                  <Textarea
                    readOnly='true'
                    isReadOnly='true'
                    value={transactionCode}
                    w='100%'
                    fontSize='11px'
                  ></Textarea>
                </>
              ) : null}
            </VStack>
          </Box>
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
              onClick={sendAuthzToFCL}
              textAlign='center'
              mt='4'
              bg={styles.primaryColor}
              mx='auto'
              maxW='150px'
              isLoading={loading}
            >
              Confirm
            </Button>
          </Flex>
        </>
      )}
    </Layout>
  )
}
