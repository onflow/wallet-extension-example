import React from 'react';
import { useHistory } from 'react-router';
import { Link, Box } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const GoBack = ({ shouldShow }) => {
  let history = useHistory();
  let content = null;
  if (shouldShow) {
    content = (
      <Link
        p={2}
        onClick={() => {
          history.goBack();
        }}
      >
        <ArrowBackIcon w={6} h={6} />
      </Link>
    );
  }
  return (
    <Box mt="4px" h="12px">
      {content}
    </Box>
  );
};

export default GoBack;
