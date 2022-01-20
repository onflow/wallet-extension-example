import React from "react"
import {Box, Flex} from "@chakra-ui/react"
import GoBack from "./GoBack"
import * as styles from "../styles"

const Layout = ({children, withGoBack}) => {
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
      <Flex direction='column' w='100%' h='100%' p='20px'>
        <GoBack shouldShow={withGoBack} />
        <Box h='20px' />
        {children}
      </Flex>
    </Box>
  )
}

export default Layout
