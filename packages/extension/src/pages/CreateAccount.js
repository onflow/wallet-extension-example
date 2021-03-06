import React, { useEffect, useState } from "react";
import {
  Button,
  Tabs,
  TabPanels,
  TabPanel,
  TabList,
  Tab,
  Spacer,
  Flex,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { ec as EC } from "elliptic";
import * as styles from "../styles";
import { useHistory } from "react-router-dom";
import Layout from "../components/Layout";
import SubmitInput from "../components/SubmitInput";
import {
  derivePrivKey,
  validateFlowAccountInfo,
} from "../controllers/accounts";
import LoadingSpinner from "../components/LoadingSpinner";
const p256 = new EC("p256");

const CreateAccount = ({ location }) => {
  const history = useHistory();
  const toast = useToast();
  const [accountAddress, setAccountAddress] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [keyID, setKeyID] = useState("0");
  const [onPrivateKeyTab, setOnPrivateKeyTab] = useState(true);
  const [pageTitle, setPageTitle] = useState("");

  const createAccount = async () => {
    let account;
    const key = p256.genKeyPair();
    const pubKey = key.getPublic("hex").slice(2);
    const privateKey = key.getPrivate("hex");
    const data = {
      publicKey: pubKey,
      signatureAlgorithm: "ECDSA_P256",
      hashAlgorithm: "SHA3_256",
    };
    const url =
      "https://hardware-wallet-api-testnet.staging.onflow.org/accounts";

    try {
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      account = await response.json();
      await validateFlowAccountInfo(account.address, privateKey, keyID);
    } catch (e) {
      toast({
        description: e.toString(),
        status: "error",
        duration: styles.toastDuration,
        isClosable: true,
      });
      return;
    }
    history.push({
      pathname: "/SetPassword",
      state: {
        ...location.state,
        privKey: privateKey,
        keyID,
        accountAddress: account.address,
        withGoBack: true,
      },
    });
  };

  const importAccount = async () => {
    let privateKey = privKey;
    try {
      if (!onPrivateKeyTab) {
        privateKey = await derivePrivKey(seedPhrase);
      }
      await validateFlowAccountInfo(accountAddress, privateKey, keyID);
    } catch (e) {
      toast({
        description: e.toString(),
        status: "error",
        duration: styles.toastDuration,
        isClosable: true,
      });
      return;
    }
    history.push({
      pathname: "/SetPassword",
      state: {
        ...location.state,
        privKey: privateKey,
        keyID: keyID,
        accountAddress: accountAddress,
        withGoBack: true,
      },
    });
  };

  useEffect(() => {
    setPageTitle(
      location.state.type === "create"
        ? "Creating Flow Account"
        : "Import Flow Account"
    );

    if (location.state.type === "create") {
      createAccount();
    }
  }, [location.state.type]);

  return (
    <Layout
      withGoBack={location && location.state && location.state.withGoBack}
      title={pageTitle}
    >
      {location.state.type === "create" ? (
        <Flex direction="row" w="100%" h="100%" align="center" justify="center">
          <LoadingSpinner />
        </Flex>
      ) : (
        <>
          <SubmitInput
            onChange={(e) => {
              setAccountAddress(e.target.value);
            }}
            value={accountAddress}
            p="4"
            mt="8"
            mb="4"
            maxW="285px"
            mx="auto"
            placeholder="Flow Account Address"
            onEnter={importAccount}
            autoFocus={true}
          />
          <Tabs
            borderTop={styles.dividerColor}
            borderTopWidth="2px"
            variant="soft-rounded"
            mt="4"
            isFitted
            onChange={(index) => {
              setOnPrivateKeyTab(index === 0);
            }}
          >
            <TabList mb="1em" maxW="285px" mx="auto">
              <Tab
                borderRadius="20px"
                color="white"
                _selected={{ color: "white", bg: styles.primaryColor }}
              >
                Import With
                <br />
                Private Key
              </Tab>
              <Tab
                borderRadius="20px"
                color="white"
                _selected={{ color: "white", bg: styles.primaryColor }}
              >
                Import With
                <br />
                Seed Phrase
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <SubmitInput
                  textArea={true}
                  onChange={(e) => {
                    setPrivKey(e.target.value);
                  }}
                  value={privKey}
                  p={4}
                  mt="2"
                  placeholder="Private Key"
                  onEnter={importAccount}
                />
              </TabPanel>
              <TabPanel>
                <SubmitInput
                  textArea={true}
                  onChange={(e) => {
                    setSeedPhrase(e.target.value);
                  }}
                  value={seedPhrase}
                  p={4}
                  mt="2"
                  placeholder="Enter Seed Phrase"
                  onEnter={importAccount}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
          <SubmitInput
            type="number"
            onChange={(e) => {
              setKeyID(e.target.value);
            }}
            value={keyID}
            mx="auto"
            p={4}
            mt="2"
            mb="6"
            maxW="285px"
            placeholder="Flow Key Index"
            onEnter={importAccount}
          />
          <Spacer />
          <Button
            onClick={importAccount}
            textAlign="center"
            m="16"
            bg={styles.secondaryColor}
            color={styles.whiteColor}
            mx="auto"
            maxW="150px"
            mt="4"
          >
            Continue
          </Button>
        </>
      )}
    </Layout>
  );
};

export default CreateAccount;
