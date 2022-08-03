import React, { useState, useEffect, useReducer } from "react";
import * as fcl from "@onflow/fcl";
import {
  Input,
  Button,
  Box,
  Text,
  VStack,
  Center,
  Textarea,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { Flex, Spacer } from "@chakra-ui/layout";
import Transaction from "../../components/Transaction";
import Layout from "../../components/Layout";
import Title from "../../components/Title";
import ErrorBoundary from "../../components/ErrorBoundary";
import { keyVault } from "../../lib/keyVault";
import { createSignature } from "../../controllers/authz";
import { useTransaction } from "../../contexts/TransactionContext";
import {verify} from "../../audits/verify";
import {audits} from "../../audits/audits"; 
import * as styles from "../../styles";

const AUDIT_DESCRIPTIONS = {
  "VERIFIED": "This transaction has been audited ✅.",
  "PENDING": "Verifying audits...",
  "UNVERIFIED": "This transaction has not been audited ⚠️.",
  "INIT": "",
}

const AUDIT_VERIFICATION_STATUS = {
  "VERIFIED": "VERIFIED",
  "PENDING": "PENDING",
  "UNVERIFIED": "UNVERIFIED",
  "INIT": "INIT",
}

const AUDIT_STATUS_REDUCER_ACTIONS = {
  "SET_VERIFIED": "SET_VERIFIED",
  "SET_UNVERIFIED": "SET_UNVERIFIED",
}

function auditStatusReducer(state, action) {
  switch (action.type) {
    case AUDIT_STATUS_REDUCER_ACTIONS.SET_VERIFIED:
      return { ...state, [action.value.message]: true }
    case AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED:
      return { ...state, [action.value.message]: false }
    default:
      return state
  }
}

export default function Authz() {
  const [opener, setOpener] = useState(null);
  const [isAuditedByMessage, dispatchIsAuditedByMessage] = useReducer(auditStatusReducer, {});
  const [signable, setSignable] = useState("{}");
  const [template, setTemplate] = useState("{}");
  const [unlocked, setUnlocked] = useState(keyVault.unlocked);
  // const [transactionCode, setTransactionCode] = useState(``);
  const [showTransactionCode, setShowTransactionCode] = useState(false);
  // const [description, setDescription] = useState(DESCRIPTIONS.INIT);
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txView, setTxView] = useState("detail");
  const [host, setHost] = useState(null);

  const { initTransactionState, setTxId, setTransactionStatus } =
    useTransaction();
  const toast = useToast();

  fcl.config().get('logger.level').then(l => console.log("extension logger.level", l))

  const fetchTemplateAndVerifyAudits = async (_signable) => {
    console.log("fetchTemplateAndVerifyAudits", _signable)

    let cadence = _signable.cadence

    let foundTemplate = await fetch(
      `https://flow-ix-template-svc-testnet.herokuapp.com/v1/template?network=testnet&cadence=${btoa(cadence)}`)
      .then(response => response.json())
      .catch(e => null)

    if (!foundTemplate) {
      dispatchIsAuditedByMessage({
        type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
        value: _signable
      })
    }

    setTemplate(JSON.stringify(foundTemplate))

    console.log("fetchTemplateAndVerifyAudits looking for Audit", _signable, foundTemplate)

    // Fetch audits from trusted auditors
    let audit = await fetch(
      `https://flow-ix-template-svc-testnet.herokuapp.com/v1/audit?template_id=${foundTemplate.id}`)
      .then(response => response.json())
      .catch(e => null)

    console.log("fetchTemplateAndVerifyAudits found Audit", _signable, foundTemplate, audit)

    if (!audit || !foundTemplate) {
      dispatchIsAuditedByMessage({
        type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
        value: _signable
      })
    }
    
    let verifiedAudit = await fcl.InteractionTemplateUtils.verifyInteractionTemplateAudit({
      template: foundTemplate,
      audit,
    })

    console.log("fetchTemplateAndVerifyAudits verified Audit", _signable, foundTemplate, audit, verifiedAudit)

    let areTemplateDependenciesSame = 
      await fcl.InteractionTemplateUtils.verifyDependencyPinsSameAtLatestSealedBlock({
        template: foundTemplate,
        networks: ["testnet"]
      })

    console.log("fetchTemplateAndVerifyAudits areTemplateDependenciesSame", areTemplateDependenciesSame)

    if (verifiedAudit) {
      dispatchIsAuditedByMessage({
        type: AUDIT_STATUS_REDUCER_ACTIONS.SET_VERIFIED,
        value: _signable
      })
    } else {
      dispatchIsAuditedByMessage({
        type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
        value: _signable
      })
    }
  }

  const fclCallback = async (data) => {
    if (typeof data != "object") return;
    if (data.type !== "FCL:VIEW:READY:RESPONSE") return;
    console.log("MSG RECEIVED", data, new Date(Date.now()).toString())

    // setDescription(DESCRIPTIONS.INIT)

    const _signable = data.body;
    const { hostname } = data.config.client;
    hostname && setHost(hostname);
    if (signable.voucher.cadence) {
      setTransactionCode(signable.voucher.cadence);
    }
    setSignable(JSON.stringify(signabl));

    // setSignable(JSON.stringify(_signable));
  }

  useEffect(() => {
    (() => fetchTemplateAndVerifyAudits(JSON.parse(signable)))()
  }, [signable])

  const extMessageHandler = async (msg, sender, sendResponse) => {
    if (msg.type === "FCL:VIEW:READY:RESPONSE") {
      await fclCallback(JSON.parse(JSON.stringify(msg || {})));
    }

    if (msg.type === "FLOW::TX") {
      setTxId(msg.txId);
      fcl.tx(msg.txId).subscribe((txStatus) => {
        setTransactionStatus(txStatus.status);
      });
    }
  };

  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: false,
        },
        (tabs) => {
          setOpener(tabs[0].id);
          chrome.tabs.sendMessage(tabs[0].id || 0, { type: "FCL:VIEW:READY" });
        }
      );

    chrome.runtime?.onMessage.addListener(extMessageHandler);
  }, []);

  async function submitPassword() {
    setLoading(true);
    try {
      await keyVault.unlockVault(password);
      setUnlocked(true);
    } catch (e) {
      toast({
        description: "Invalid password",
        status: "error",
        duration: styles.toastDuration,
        isClosable: true,
      });
    }
    setLoading(false);
  }

  async function sendAuthzToFCL() {
    initTransactionState();
    const signedMessage = await createSignature(
      fcl.WalletUtils.encodeMessageFromSignable(JSON.parse(signable), JSON.parse(signable).addr),
      JSON.parse(signable).addr,
      JSON.parse(signable).keyId
    );

    chrome.tabs.sendMessage(parseInt(opener), {
      f_type: "PollingResponse",
      f_vsn: "1.0.0",
      status: "APPROVED",
      reason: null,
      data: new fcl.WalletUtils.CompositeSignature(
        JSON.parse(signable).addr,
        JSON.parse(signable).keyId,
        signedMessage
      ),
    });

    // verifyTemplateAudit("{}")
    // setIsAudited(false)
    // setDescription("This transaction has not been audited ⚠️.")

    setTxView("sending")
  }

  function sendCancelToFCL() {
    // setSignable("{}")
    // setIsAudited(false)
    // setDescription("This transaction has not been audited ⚠️.")

    chrome.tabs.sendMessage(parseInt(opener), { type: "FCL:VIEW:CLOSE" });

    window.close()
  }

  const parsedSignable = JSON.parse(signable)
  const parsedTemplate = JSON.parse(template)
  // let isAudited = isAuditedByMessage?.[parsedSignable?.message] || false
  
  let description = isAuditedByMessage[parsedSignable.message] !== undefined
    ? (isAuditedByMessage[parsedSignable.message] ? AUDIT_DESCRIPTIONS.VERIFIED : AUDIT_DESCRIPTIONS.UNVERIFIED)
    : AUDIT_DESCRIPTIONS.UNVERIFIED

  // console.log("template", template)
  // console.log("parsedSignable", parsedSignable)
  // console.log("isAuditedByMessage", isAuditedByMessage)
  // console.log("isAudited", isAudited)
  // console.log("signable", parsedSignable)

  return (
    <Layout withGoBack={false}>
      <ErrorBoundary>
        {!unlocked ? (
          <>
            <Title>Unlock your wallet to confirm the transaction</Title>
            <Flex>
              <Spacer />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                mx="auto"
                maxW="220px"
                p="2"
                mt="24"
                placeholder="Password"
              ></Input>
              <Spacer />
            </Flex>

            <Flex>
              <Spacer />
              <Button
                onClick={submitPassword}
                textAlign="center"
                mt="4"
                bg={styles.primaryColor}
                color={styles.whiteColor}
                mx="auto"
                maxW="150px"
              >
                Continue
              </Button>
              <Spacer />
            </Flex>
          </>
        ) : (
          (() => {
            switch (txView) {
              case "detail":
                return (
                  <>
                    <Title align="center">Confirm Transaction</Title>
                    <Box mx="auto" w="280px">
                      <Text
                        mt="32px"
                        fontWeight="bold"
                        fontSize="20px"
                        color={"white"}
                      >
                        {host}
                      </Text>
                      <br />
                      <Text fontSize="18px" mt="12px">
                        Transaction
                      </Text>
                      <Text> {description} </Text>
                      <br />
                      {parsedSignable && parsedTemplate && parsedTemplate.data.arguments && (
                        <>
                        {
                          parsedTemplate.data.messages?.title?.i18n?.["en-US"] && (
                            <Text
                              align="left"
                              color="gray.100"
                              textAlign="left"
                              fontWeight="medium"
                              fontSize="16px"
                            >
                              <Text fontSize="16px" color={styles.flowColor}>
                                Title:
                              </Text>
                              {parsedTemplate.data.messages?.title?.i18n?.["en-US"]}
                            </Text>
                          )
                        }
                        {
                          parsedTemplate.data.messages?.description?.i18n?.["en-US"] && (
                            <Text
                              align="left"
                              color="gray.100"
                              textAlign="left"
                              fontWeight="medium"
                              fontSize="16px"
                            >
                              <Text fontSize="16px" color={styles.flowColor}>
                              Description:
                              </Text>
                              {parsedTemplate.data.messages?.description?.i18n?.["en-US"]}
                            </Text>
                          )
                        }
                        </>
                      )}
                      <VStack
                        mt="4px"
                        p="12px"
                        borderTopWidth="3px"
                        borderBottomWidth="3px"
                        borderColor="gray.500"
                      >
                        <Center>
                          <Text
                            align="center"
                            color="gray.100"
                            textAlign="center"
                            fontWeight="medium"
                            fontSize="16px"
                            textDecoration="underline"
                            cursor="pointer"
                            onClick={() => {
                              setShowTransactionCode(!showTransactionCode);
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
                              readOnly="true"
                              isReadOnly="true"
                              value={parsedSignable.cadence}
                              w="100%"
                              fontSize="11px"
                            ></Textarea>
                          </>
                        ) : null}
                      </VStack>
                      <br/>
                      {parsedSignable && parsedTemplate && parsedTemplate.data.arguments && (
                        <>
                          <Text fontSize="18px" mt="12px">
                            Arguments
                          </Text>
                          <VStack
                            mt="8px"
                            p="12px"
                            pl="0px"
                            pr="0px"
                            borderTopWidth="3px"
                            borderBottomWidth="3px"
                            borderColor="gray.500"
                            align="left"
                          >
                            {parsedSignable && parsedTemplate && parsedTemplate.data.arguments && (
                              Object.keys(parsedTemplate.data.arguments).map(argKey => (
                                <>
                                  <Text
                                    align="left"
                                    color="gray.100"
                                    textAlign="left"
                                    fontWeight="medium"
                                    fontSize="16px"
                                  >
                                    <Text 
                                      fontSize="16px"
                                      color={styles.flowColor}
                                    >
                                      {argKey}
                                    </Text>
                                  </Text>
                                  <Text
                                    align="left"
                                    color="gray.100"
                                    textAlign="left"
                                    fontWeight="medium"
                                    fontSize="16px"
                                  >
                                    Title: {parsedTemplate.data.arguments[argKey]?.messages?.title?.i18n?.["en-US"]}
                                  </Text>
                                  <Text
                                    align="left"
                                    color="gray.100"
                                    textAlign="left"
                                    fontWeight="medium"
                                    fontSize="16px"
                                  >
                                    Value: <b>{parsedSignable?.voucher?.arguments[parsedTemplate.data.arguments[argKey]?.index]?.value}</b>
                                  </Text> 
                                  <br/>
                                </>                   
                              ))
                            )}
                          </VStack>
                        </>
                      )}
                      <br/>
                      <Text fontSize="18px" mt="12px">
                        Estimated Fees
                      </Text>
                      <VStack
                        mt="8px"
                        p="12px"
                        borderTopWidth="3px"
                        borderBottomWidth="3px"
                        borderColor="gray.500"
                      >
                        <Center>
                          <Text
                            align="center"
                            color="gray.100"
                            textAlign="center"
                            fontWeight="medium"
                            fontSize="16px"
                          >
                            Flow ₣0.0001
                          </Text>
                        </Center>
                      </VStack>
                    </Box>
                    <Spacer />
                    <Flex direction="row" align="center" justify="center">
                      <div>
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
                          onClick={sendAuthzToFCL}
                          textAlign="center"
                          mt="4"
                          bg={styles.primaryColor}
                          color={styles.whiteColor}
                          mx="auto"
                          maxW="150px"
                          isLoading={loading}
                        >
                          Confirm
                        </Button>
                      </div>
                    </Flex>
                  </>
                );
              case "sending":
                return (
                  <Flex
                    direction="col"
                    w="100%"
                    h="100%"
                    align="center"
                    justify="center"
                  >
                    <Transaction />
                  </Flex>
                );
              default:
                return null;
            }
          })()
        )}
      </ErrorBoundary>
    </Layout>
  );
}
