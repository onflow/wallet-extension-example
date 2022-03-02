import React, { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import Title from "../components/Title";
import PopupLayout from "../components/PopupLayout";
import BalanceCard from "../components/BalanceCard";
import { accountManager } from "../lib/AccountManager";

const Balances = () => {
  const [account, setAccount] = useState(null);

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
  const address = account ? account.address : "";
  return (
    <PopupLayout selectedPage="balances">
      <Title align="left">Balances</Title>
      <Text fontSize="lg" mt="20px">
        Logged in to <span style={{ fontWeight: "bold" }}>{address}</span>
      </Text>
      <BalanceCard currency="flow" address={account.address} />
      <BalanceCard currency="fusd" address={account.address} />
    </PopupLayout>
  );
};

export default Balances;
