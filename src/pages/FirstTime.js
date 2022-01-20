import React from "react"
import {Img, Button, Text} from "@chakra-ui/react"
import FlowLogo from "../assets/flow-logo.png"
import * as styles from "../styles"
import {useHistory} from "react-router-dom"
import Layout from "../components/Layout"

const FirstTime = ({location}) => {
  const history = useHistory()

  return (
    <Layout
      withGoBack={location && location.state && location.state.withGoBack}
    >
      <Img src={FlowLogo} />
      <Button
        onClick={() => {
          history.push({
            pathname: "/CreateAccount",
            state: {type: "create", withGoBack: true},
          })
        }}
        mt='14'
        marginLeft='auto'
        marginRight='auto'
        maxW='150px'
        textAlign='center'
        bg={styles.primaryColor}
        isDisabled={true}
      >
        Create Account
      </Button>
      <Text mt='6' fontSize='md' textAlign='center'>
        OR
      </Text>
      <Button
        onClick={() => {
          history.push({
            pathname: "/CreateAccount",
            state: {type: "import", withGoBack: true},
          })
        }}
        mt='6'
        marginLeft='auto'
        marginRight='auto'
        maxW='150px'
        textAlign='center'
        bg={styles.secondaryColor}
      >
        Import Account
      </Button>
    </Layout>
  )
}

export default FirstTime
