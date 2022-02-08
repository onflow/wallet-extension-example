import React from "react"
import {useHistory} from "react-router"
import {Box, Flex, Icon, Center} from "@chakra-ui/react"
import {TimeIcon, HamburgerIcon} from "@chakra-ui/icons"
import {
  MdOutlineAttachMoney,
  MdOutlineCollections,
  MdOutlineSwapVert,
} from "react-icons/md"
import * as styles from "../styles"

const PopupLayout = ({children, selectedPage}) => {
  const history = useHistory()

  // If we are not on the extension, set the extension in the middle of the page
  // To detect we are on a non-extension page, check if the width of the entire screen is too big
  /*   const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  )
  const shouldIncludeMargins = vw > 357 */

  const navigate = pathname => {
    history.push({
      pathname: pathname,
      state: {
        withGoBack: pathname === "/UserMenu",
      },
    })
  }

  return (
    <Box
      w={"375px"}
      h={"600px"}
      bg={styles.bgColor}
      color={styles.fgColor}
      bgGradient={`linear(to-t, ${styles.bgColor}, gray.900)`}
      overflowX='hidden'
      overflowY='scroll'
      css={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Flex direction='column'>
        <Box
          h='46px'
          w='100%'
          bg={styles.bgNavbar}
          bgGradient={`linear(to-t, ${styles.bgNavbar}, gray.800)`}
          css={{
            'position': 'absolute',
            'top': '0px',
            'left': '0px',
            'right': '0px'
          }}>
          <Flex h='46px' w='100%'>
            <Center cursor='pointer'>
              <HamburgerIcon
                ml='12px'
                w={6}
                h={6}
                onClick={() => {
                  navigate("/UserMenu")
                }}
              />
            </Center>
          </Flex>
        </Box>
        <Box
          h='594px'
          bg={styles.bgColor}
          w='100%'
          p='20px'
          bgGradient={`linear(to-tl, ${styles.bgColor}, gray.700)`}
          css={{
            paddingTop: '50px',
            paddingBottom: '150px'
          }}
        >
          {children}
        </Box>
        <Box
          h='60px'
          w='100%'
          bg={styles.bgNavbar}
          cursor='pointer'
          bgGradient={`linear(to-b, ${styles.bgNavbar}, gray.800)`}
          css={{
            'position': 'absolute',
            'bottom': '0px',
            'left': '0px',
            'right': '0px'
          }}
        >
          <Flex h='60px' w='100%'>
            <Center
              grow={true}
              width='25%'
              onClick={() => navigate("/Balances")}
            >
              <Icon
                as={MdOutlineAttachMoney}
                w={6}
                h={6}
                color={
                  selectedPage === "balances" ? styles.primaryColor : "#fff"
                }
              ></Icon>
            </Center>
            <Center grow={true} width='25%' onClick={() => navigate("/NFTs")}>
              <Icon
                as={MdOutlineCollections}
                w={6}
                h={6}
                color={selectedPage === "nfts" ? styles.primaryColor : "#fff"}
              />
            </Center>
            <Center grow={true} width='25%' onClick={() => navigate("/Swaps")}>
              <Icon
                as={MdOutlineSwapVert}
                w={6}
                h={6}
                color={selectedPage === "swaps" ? styles.primaryColor : "#fff"}
              />
            </Center>
            <Center
              grow={true}
              width='25%'
              onClick={() => navigate("/History")}
            >
              <TimeIcon
                w={6}
                h={6}
                color={
                  selectedPage === "history" ? styles.primaryColor : "#fff"
                }
              />
            </Center>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

export default PopupLayout
