import React, { useEffect, useState } from "react";
import { Box, Flex, Image, Text, Button, Spacer } from "@chakra-ui/react";
import Title from "../components/Title";
import PopupLayout from "../components/PopupLayout";
import { accountManager } from "../lib/AccountManager";
import LoadingSpinner from "../components/LoadingSpinner";
import * as styles from "../styles";

const NFTs = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [nftFetchErr, setNftFetchErr] = useState(null);

  const fetchNfts = async () => {
    try {
      setLoading(true);
      const url =
        "https://flow-mainnet.g.alchemy.com/v2/89sw1zoybafxhqayvhjwf6se5yml2y99/getNFTs/?owner=0x9eef2e4511390ce4&offset=0&limit=5";
      let response = await fetch(url);
      const nftsRes = await response.json();
      setData(nftsRes);
    } catch (e) {
      console.log(e);
      setNftFetchErr("Error Fetching NFTs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function getAccount() {
      const account = await accountManager.getFavoriteAccount();
      setAccount(account);
    }
    getAccount();
    fetchNfts();
  }, []);

  if (!account) {
    return null;
  }

  const metadataValueFinder = (metadata, name) =>
    metadata?.find((md) => md.name === name)?.value;

  return (
    <PopupLayout selectedPage="nfts">
      <Title align="left" mb="2">
        NFTs for Account {account.address || ""}
      </Title>
      <Spacer />
      {loading ? (
        <Flex direction="row" w="100%" h="100%" align="center" justify="center">
          <LoadingSpinner />
        </Flex>
      ) : (
        <div>
          {nftFetchErr && (
            <Flex
              direction="row"
              w="100%"
              h="100%"
              align="center"
              justify="center"
            >
              {nftFetchErr}
              <Button
                onClick={fetchNfts}
                textAlign="center"
                mt="4"
                bg={styles.primaryColor}
                color={styles.whiteColor}
                mx="auto"
                maxW="150px"
              >
                Retry
              </Button>
            </Flex>
          )}
          {data.nfts &&
            data.nfts.map((nft) => {
              const nftMetadata = nft?.metadata?.metadata || [];

              return (
                <Box
                  key={nft.id.tokenId}
                  mb="2"
                  mt="2"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <Image
                    src={metadataValueFinder(nftMetadata, "img").replace(
                      "ipfs://",
                      "https://gateway.pinata.cloud/ipfs/"
                    )}
                  />

                  <Box p="4">
                    <Text fontSize="lg" mt={1}>
                      {metadataValueFinder(nftMetadata, "title")}
                    </Text>
                    <Text as="i">
                      {metadataValueFinder(nftMetadata, "description")}
                    </Text>
                  </Box>
                </Box>
              );
            })}
        </div>
      )}
    </PopupLayout>
  );
};

export default NFTs;
