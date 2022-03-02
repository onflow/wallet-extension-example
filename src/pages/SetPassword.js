import React, { useState } from 'react';
import { Text, Button, useToast } from '@chakra-ui/react';
import Title from '../components/Title';
import GoBack from '../components/GoBack';
import * as styles from '../styles';
import { createOrImportAccount } from '../controllers/accounts';
import { useHistory } from 'react-router';
import { keyVault } from '../lib/keyVault';
import Layout from '../components/Layout';
import SubmitInput from '../components/SubmitInput';

const SetPassword = ({ location }) => {
  const [loading, setLoading] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const history = useHistory();

  const loggedIn = !!keyVault.unlocked;

  const toast = useToast();

  const actionType = location.state.type;
  const privKey = location.state.privKey;
  const keyID = location.state.keyID;
  const accountAddress = location.state.accountAddress;

  const importOrCreateAccount = async (skipConfirmPwd) => {
    if (!skipConfirmPwd && pwd !== confirmPwd) {
      toast({
        description: 'Password and Confirm Password fields must match',
        status: 'error',
        duration: styles.toastDuration,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    if (actionType === 'import') {
      try {
        await createOrImportAccount(accountAddress, privKey, keyID, pwd);
        history.push({
          pathname: '/Balances',
          state: { type: 'create' },
        });
        toast({
          description: `Account Imported!`,
          status: 'success',
          duration: styles.toastDuration,
          isClosable: true,
        });
      } catch (e) {
        toast({
          description: `Failed to import account - ${e.message}`,
          status: 'error',
          duration: styles.toastDuration,
          isClosable: true,
        });
      }
    } else {
      try {
        await createOrImportAccount(accountAddress, privKey, keyID, pwd);
        history.push({
          pathname: '/Balances',
          state: { type: 'create' },
        });
        toast({
          description: `Account Created!`,
          status: 'success',
          duration: styles.toastDuration,
          isClosable: true,
        });
      } catch (e) {
        toast({
          description: `Failed to create account - ${e.message}`,
          status: 'error',
          duration: styles.toastDuration,
          isClosable: true,
        });
      }
    }
    setLoading(false);
  };

  let content = null;
  if (loggedIn) {
    content = (
      <>
        <Title>Confirm your Password</Title>
        <Text align="center">
          Your password is used to encrypt your new account's keys
        </Text>
        <SubmitInput
          type="password"
          onChange={(e) => {
            setPwd(e.target.value);
          }}
          value={pwd}
          mx="auto"
          maxW="220px"
          p="2"
          mt="24"
          mb="6"
          placeholder="Password"
          autoFocus="true"
          onEnter={() => importOrCreateAccount(true)}
        />

        <Button
          onClick={() => importOrCreateAccount(true)}
          textAlign="center"
          m="16"
          bg={styles.secondaryColor}
          color={styles.whiteColor}
          mx="auto"
          maxW="150px"
          isLoading={loading}
        >
          Continue
        </Button>
      </>
    );
  } else {
    content = (
      <>
        <Title>Set a Password</Title>
        <Text align="center">
          Your password will be used to unlock
          <br />
          this wallet - Don't forget it!
        </Text>
        <SubmitInput
          type="password"
          onChange={(e) => {
            setPwd(e.target.value);
          }}
          value={pwd}
          mx="auto"
          maxW="220px"
          p="2"
          mt="24"
          mb="6"
          placeholder="Password"
          autoFocus="true"
          onEnter={() => importOrCreateAccount(false)}
        />

        <SubmitInput
          type="password"
          onChange={(e) => {
            setConfirmPwd(e.target.value);
          }}
          value={confirmPwd}
          mx="auto"
          maxW="220px"
          p="2"
          mt="6"
          mb="6"
          placeholder="Confirm Password"
          onEnter={() => importOrCreateAccount(false)}
        />

        <Button
          onClick={() => importOrCreateAccount(false)}
          textAlign="center"
          m="16"
          bg={styles.secondaryColor}
          color={styles.whiteColor}
          mx="auto"
          maxW="150px"
          isLoading={loading}
        >
          Continue
        </Button>
      </>
    );
  }
  return (
    <Layout
      withGoBack={location && location.state && location.state.withGoBack}
    >
      <GoBack />
      {content}
    </Layout>
  );
};

export default SetPassword;
