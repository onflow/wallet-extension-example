import React, { useState, useEffect } from 'react';
import {
  Button,
  Text,
  Flex,
  Spacer,
  Box,
  Image,
  Center,
  VStack,
} from '@chakra-ui/react';
import Title from '../../components/Title';
import Layout from '../../components/Layout';
import { accountManager } from '../../lib/AccountManager';
import { authnServiceDefinition } from '../../controllers/serviceDefinition';
import * as styles from '../../styles';
import FlowLogo from '../../assets/flow-logo.png';

export default function Authn({ location }) {
  const [opener, setOpener] = useState(null);
  const [account, setAccount] = useState(null);
  const [host, setHost] = useState(null);

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
        (tabs) => {
          /**
           * Sends a single message to the content script(s) in the specified tab,
           * with an optional callback to run when a response is sent back.
           *
           * The runtime.onMessage event is fired in each content script running
           * in the specified tab for the current extension.
           */
          setOpener(tabs[0].id);
          chrome.tabs.sendMessage(tabs[0].id || 0, { type: 'FCL:VIEW:READY' });
        }
      );

    const extMessageHandler = (msg, sender, sendResponse) => {
      if (msg.type === 'FCL:VIEW:READY:RESPONSE') {
        const { hostname } = msg.config.client;
        hostname && setHost(hostname);
      }
    };

    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    chrome.runtime?.onMessage.addListener(extMessageHandler);
  }, []);

  useEffect(() => {
    async function getAccount() {
      const account = await accountManager.getFavoriteAccount();
      setAccount(account);
    }
    getAccount();
  }, []);

  if (!account) {
    return null;
  }

  const address = account ? account.address : '';

  function sendAuthnToFCL() {
    // Since we only allow keys >1000 weight, it doesn't matter which key we select
    const keyId = account.listKeys()[0].id;
    const services = authnServiceDefinition(address, keyId);

    chrome.tabs.sendMessage(parseInt(opener), {
      f_type: 'PollingResponse',
      f_vsn: '1.0.0',
      status: 'APPROVED',
      reason: null,
      data: {
        f_type: 'AuthnResponse',
        f_vsn: '1.0.0',
        addr: address,
        services: services,
      },
    });
    window.close();
  }

  function sendCancelToFCL() {
    chrome.tabs.sendMessage(parseInt(opener), { type: 'FCL:VIEW:CLOSE' });
    window.close();
  }

  return (
    <Layout withGoBack={false}>
      <Title align="center">Sign In</Title>
      <Box mx="auto" w="280px">
        <Text mt="32px" fontWeight="bold" fontSize="20px" color={'white'}>
          {host}
        </Text>
        <br />
        <Text fontSize="16px" mt="20px">
          This app would like to:
        </Text>
        <Flex
          mt="16px"
          p="12px"
          borderTopWidth="3px"
          borderBottomWidth="3px"
          borderColor="gray.500"
        >
          <VStack textAlign="left">
            <Text
              fontWeight="medium"
              fontSize="16px"
              color="gray.300"
              textAlign="left"
            >
              View your Flow Address
            </Text>
            <Text fontWeight="semibold" fontSize="16px" textAlign="left">
              {address}
            </Text>
          </VStack>
          <Spacer />
          <Center>
            <Image src={FlowLogo} w={12} h={12} />
          </Center>
        </Flex>
      </Box>
      <Spacer />
      <Flex>
        <Spacer />
        <Button
          onClick={sendCancelToFCL}
          textAlign="center"
          mt="4"
          bg={styles.tertiaryColor}
          mx="auto"
          mr="16px"
          maxW="150px"
        >
          Cancel
        </Button>
        <Button
          onClick={sendAuthnToFCL}
          textAlign="center"
          mt="4"
          bg={styles.primaryColor}
          color={styles.whiteColor}
          mx="auto"
          maxW="150px"
        >
          Confirm
        </Button>
      </Flex>
    </Layout>
  );
}
