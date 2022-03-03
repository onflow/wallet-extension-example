import React, { useEffect, useState } from "react";
import {
  Text,
  VStack,
  Box,
  Flex,
  Center,
  Icon,
  Image,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { AiFillDollarCircle } from "react-icons/ai";
import * as styles from "../styles";
import FlowLogo from "../assets/flow-logo.png";
import { getTokenBalance } from "../controllers/fungibleTokens";

const retrieveBalance = async (currency, address) => {
  if (!address) {
    return "--";
  }
  return await getTokenBalance(currency, address);
};

const BalanceCard = ({ currency, address }) => {
  currency = currency.toLowerCase();
  const [balance, setBalance] = useState("--");
  const ftTokenName = currency === "flow" ? "Flow" : "FUSD";

  useEffect(() => {
    async function getBalance() {
      setBalance(await retrieveBalance(currency, address));
    }
    getBalance();
  }, [currency, address]);

  return (
    <Box
      bg="#333"
      mx="auto"
      my="20px"
      w="100%"
      p="20px"
      fontSize="20px"
      borderRadius="10px"
    >
      <Flex>
        <Center>
          {currency === "flow" ? (
            <Image src={FlowLogo} w={10} h={10} />
          ) : (
            <Icon
              as={AiFillDollarCircle}
              w={10}
              h={10}
              color={styles.flowColor}
              stroke="white"
            />
          )}
        </Center>
        <VStack ml="auto" mr="auto" w="50%">
          <Text fontWeight="semibold" color="#ddd">
            {ftTokenName} Balance
          </Text>
          <Text fontWeight="bold" fontSize="24px">
            {currency === "flow" ? "₣" : "$"}
            {balance}
          </Text>
        </VStack>
        <Center>
          <Link
            href={`https://testnet.flowscan.org/account/${address}`}
            isExternal
          >
            <ExternalLinkIcon w={6} h={6} color={styles.primaryColor} />
          </Link>
        </Center>
      </Flex>
    </Box>
  );
};

export default BalanceCard;
