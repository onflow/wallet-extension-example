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
import { verify } from "../../audits/verify";
import { audits } from "../../audits/audits";
import * as styles from "../../styles";

const AUDIT_DESCRIPTIONS = {
  VERIFIED: "This transaction has been audited ✅.",
  PENDING_TEMPLATE: "Fetching template...",
  PENDING_AUDITS: "Verifying audits...",
  UNVERIFIED: "This transaction has not been audited ⚠️.",
  PENDING_DEPENDENCIES: "Verifying dependency tree...",
  INIT: "",
};

const AUDIT_VERIFICATION_STATUS = {
  VERIFIED: "VERIFIED",
  PENDING: "PENDING",
  UNVERIFIED: "UNVERIFIED",
  INIT: "INIT",
};

const AUDIT_STATUS_REDUCER_ACTIONS = {
  SET_VERIFIED: "SET_VERIFIED",
  SET_UNVERIFIED: "SET_UNVERIFIED",
};

function auditStatusReducer(state, action) {
  switch (action.type) {
    case AUDIT_STATUS_REDUCER_ACTIONS.SET_VERIFIED:
      return { ...state, [action.value.signable.message]: {
        verified: true,
        status: action.value.status,
      }};
    case AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED:
      return { ...state, [action.value.signable.message]: {
        verified: false,
        status: action.value.status,
      }};
    default:
      return state;
  }
}

const TEMPLATE_RESOLVERS = [
  async (cadence) => {
    return fetch(
      `https://flix.flow.com/v1/templates/search`, 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cadence_base64: btoa(cadence),
          network: "testnet"
        })
      }
    )
      .then((response) => response.json())
      .catch((e) => null);
  },
];

export default function Authz() {
  const [opener, setOpener] = useState(null);
  const [isAuditedByMessage, dispatchIsAuditedByMessage] = useReducer(
    auditStatusReducer,
    {}
  );
  const [signable, setSignable] = useState("{}");
  const [template, setTemplate] = useState("{}");
  const [unlocked, setUnlocked] = useState(keyVault.unlocked);
  const [showTransactionCode, setShowTransactionCode] = useState(false);
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txView, setTxView] = useState("detail");
  const [host, setHost] = useState(null);

  const { initTransactionState, setTxId, setTransactionStatus } =
    useTransaction();
  const toast = useToast();

  fcl
    .config()
    .get("logger.level")
    .then((l) => console.log("extension logger.level", l));

  const fetchTemplateAndVerifyAudits = async (_signable) => {
    let cadence = _signable.cadence;

    dispatchIsAuditedByMessage({
      type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
      value: {
        signable: _signable,
        status: AUDIT_DESCRIPTIONS.PENDING_TEMPLATE
      }
    });

    let foundTemplates = (
      await Promise.all(
        TEMPLATE_RESOLVERS.map(async (templateResolver) =>
          templateResolver(cadence)
        )
      )
    ).filter((a) => a !== null && (Array.isArray(a) ? a.length > 0 : true));
    let foundTemplate = foundTemplates[0];
    if (Array.isArray(foundTemplate)) foundTemplate = foundTemplate[0];

    if (!foundTemplate) {
      dispatchIsAuditedByMessage({
        type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
        value: {
          signable: _signable,
          status: AUDIT_DESCRIPTIONS.UNVERIFIED
        }
      });
      return;
    }

    setTemplate(JSON.stringify(foundTemplate));

    if (!foundTemplate) {
      dispatchIsAuditedByMessage({
        type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
        value: {
          signable: _signable,
          status: AUDIT_DESCRIPTIONS.UNVERIFIED
        }
      });
      return;
    }

    dispatchIsAuditedByMessage({
      type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
      value: {
        signable: _signable,
        status: AUDIT_DESCRIPTIONS.PENDING_AUDITS
      }
    });

    let audits =
      await fcl.InteractionTemplateUtils.getInteractionTemplateAudits({
        template: foundTemplate,
      });

    let isAudited = Boolean(Object.values(audits).find((a) => a === true));

    dispatchIsAuditedByMessage({
      type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
      value: {
        signable: _signable,
        status: AUDIT_DESCRIPTIONS.PENDING_DEPENDENCIES
      }
    });

    let areTemplateDependenciesSame =
      await fcl.InteractionTemplateUtils.verifyDependencyPinsSameAtLatestSealedBlock(
        {
          template: foundTemplate,
          network: "testnet",
        }
      );

    if (isAudited && areTemplateDependenciesSame) {
      dispatchIsAuditedByMessage({
        type: AUDIT_STATUS_REDUCER_ACTIONS.SET_VERIFIED,
        value: {
          signable: _signable,
          status: AUDIT_DESCRIPTIONS.VERIFIED
        },
      });
    } else {
      dispatchIsAuditedByMessage({
        type: AUDIT_STATUS_REDUCER_ACTIONS.SET_UNVERIFIED,
        value: {
          signable: _signable,
          status: AUDIT_DESCRIPTIONS.VERIFIED
        },
      });
    }
  };

  const fclCallback = async (data) => {
    if (typeof data != "object") return;
    if (data.type !== "FCL:VIEW:READY:RESPONSE") return;
    console.log("MSG RECEIVED", data, new Date(Date.now()).toString());

    const _signable = data.body;
    const { hostname } = data.config.client;
    hostname && setHost(hostname);

    setSignable(JSON.stringify(_signable));
  };

  useEffect(() => {
    (() => fetchTemplateAndVerifyAudits(JSON.parse(signable)))();
  }, [signable]);

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
      fcl.WalletUtils.encodeMessageFromSignable(
        JSON.parse(signable),
        JSON.parse(signable).addr
      ),
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

    setTxView("sending");
  }

  function sendCancelToFCL() {
    chrome.tabs.sendMessage(parseInt(opener), { type: "FCL:VIEW:CLOSE" });

    window.close();
  }

  const parsedSignable = JSON.parse(signable);
  const parsedTemplate = JSON.parse(template);

  let description =
    isAuditedByMessage[parsedSignable.message] !== undefined
      ? isAuditedByMessage[parsedSignable.message].status
      : AUDIT_DESCRIPTIONS.UNVERIFIED;

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
                      {parsedSignable &&
                        parsedTemplate &&
                        parsedTemplate?.data?.arguments && (
                          <>
                            {parsedTemplate?.data.messages?.title?.i18n?.[
                              "en-US"
                            ] && (
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
                                {
                                  parsedTemplate?.data.messages?.title?.i18n?.[
                                    "en-US"
                                  ]
                                }
                              </Text>
                            )}
                            {parsedTemplate?.data?.messages?.description
                              ?.i18n?.["en-US"] && (
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
                                {
                                  parsedTemplate?.data?.messages?.description
                                    ?.i18n?.["en-US"]
                                }
                              </Text>
                            )}
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
                      <br />
                      {parsedSignable &&
                        parsedTemplate &&
                        parsedTemplate?.data?.arguments && (
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
                              {parsedSignable &&
                                parsedTemplate &&
                                parsedTemplate?.data?.arguments &&
                                Object.keys(
                                  parsedTemplate?.data?.arguments
                                ).map((argKey) => (
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
                                      Title:{" "}
                                      {
                                        parsedTemplate?.data?.arguments[argKey]
                                          ?.messages?.title?.i18n?.["en-US"]
                                      }
                                    </Text>
                                    <Text
                                      align="left"
                                      color="gray.100"
                                      textAlign="left"
                                      fontWeight="medium"
                                      fontSize="16px"
                                    >
                                      Value:{" "}
                                      <b>
                                        {
                                          parsedSignable?.voucher?.arguments[
                                            parsedTemplate?.data?.arguments[
                                              argKey
                                            ]?.index
                                          ]?.value
                                        }
                                      </b>
                                    </Text>
                                    <br />
                                  </>
                                ))}
                            </VStack>
                          </>
                        )}
                      <br />
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
