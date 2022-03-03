import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import PopupLayout from "../components/PopupLayout";
import MoonPay from "../components/MoonPay";
import { accountManager } from "../lib/AccountManager";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
} from "@chakra-ui/react";
import * as styles from "../styles";

const Swaps = () => {
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
    <PopupLayout selectedPage="swaps">
      <Title align="left">Swaps</Title>
      <Tabs
        borderTop={styles.dividerColor}
        borderTopWidth="2px"
        variant="soft-rounded"
        mt="0"
        isFitted
        pt="0"
      >
        <TabList mb="0em" maxW="340px" mx="auto" pt="0">
          <Tab
            p={2}
            borderRadius="20px"
            color="white"
            _selected={{ color: "white", bg: styles.primaryColor }}
          >
            Buy Flow (or FUSD) with MoonPay
          </Tab>
          <Tab
            p={2}
            borderRadius="20px"
            color="white"
            _selected={{ color: "white", bg: styles.primaryColor }}
          >
            Swap Flow, FUSD and more with Blocto
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MoonPay accountAddress={address} />
          </TabPanel>
          <TabPanel>
            <Text>Coming soon!</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </PopupLayout>
  );
};

export default Swaps;
