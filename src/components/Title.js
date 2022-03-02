import React from 'react';
import { Text } from '@chakra-ui/react';

const Title = ({ children, align }) => {
  return (
    <Text
      fontWeight="semibold"
      textAlign={align ? align : 'center'}
      fontSize="2xl"
    >
      {children}
    </Text>
  );
};
export default Title;
