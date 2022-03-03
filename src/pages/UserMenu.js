import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Text, Box, VStack } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { accountManager } from "../lib/AccountManager";
import { keyVault } from "../lib/keyVault";
import Title from "../components/Title";
import SelectableListItem from "../components/SelectableListItem";
import Layout from "../components/Layout";
import * as styles from "../styles";

const UserMenu = ({ location }) => {
  const [account, setAccount] = useState(null);
  const history = useHistory();
  const toast = useToast();

  useEffect(() => {
    async function getAccount() {
      const account = await accountManager.getFavoriteAccount();
      console.log("load accounts", account);
      setAccount(account);
    }
    getAccount();
  }, []);

  if (!account) {
    return null;
  }
  const address = account ? account.address : "";

  const lockWallet = async () => {
    await keyVault.lockVault();
    history.push({
      pathname: "/LogIn",
    });
  };

  return (
    <Layout
      withGoBack={location && location.state && location.state.withGoBack}
    >
      <Title align="left">Settings</Title>
      <Text fontSize="lg" mt="20px">
        Logged in to <span style={{ fontWeight: "bold" }}>{address}</span>
      </Text>
      <VStack>
        <SelectableListItem
          text="Switch Account"
          onClick={() => {
            history.push({
              pathname: "/SelectAccount",
              state: { withGoBack: true, type: "switch" },
            });
          }}
        />
        <Box mt="20px" />
        <SelectableListItem
          text="Manage Accounts"
          onClick={() => {
            history.push({
              pathname: "/SelectAccount",
              state: { withGoBack: true, type: "manage" },
            });
          }}
        />
        <Box mt="20px" />
        <SelectableListItem text="Lock Wallet" onClick={lockWallet} />
        <Box mt="20px" />
        <SelectableListItem
          text="Change Password"
          onClick={() => {
            toast({
              description: "Password changes are not yet available.",
              status: "error",
              duration: styles.toastDuration,
              isClosable: true,
            });
          }}
        />
      </VStack>
    </Layout>
  );
};

export default UserMenu;
