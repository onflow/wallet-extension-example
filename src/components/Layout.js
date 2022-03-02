import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import GoBack from './GoBack';
import * as styles from '../styles';
import Title from './Title';

const Layout = ({ children, withGoBack, title }) => {
  return (
    <Box
      w={'375px'}
      h={'600px'}
      bg={styles.bgColor}
      color={styles.fgColor}
      overflowX="hidden"
      overflowY="scroll"
      css={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }}
    >
      <Flex direction="column" w="100%" h="100%" p="20px">
        <Flex direction="row">
          <GoBack shouldShow={withGoBack} />
          <Box flex="1">
            <Title align="left">{title}</Title>
          </Box>
        </Flex>
        <Box h="20px" />
        {children}
      </Flex>
    </Box>
  );
};

export default Layout;
