import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import PopupLayout from "../components/PopupLayout";
import { accountManager } from "../lib/AccountManager";

const History = ({}) => {
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
    <PopupLayout selectedPage="history">
      <Title align="left">History</Title>
    </PopupLayout>
  );
};

export default History;
