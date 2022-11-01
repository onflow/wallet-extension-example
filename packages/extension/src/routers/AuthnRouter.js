import React, { useEffect, useState } from "react";
import { MemoryRouter, Route } from "react-router";
import { AnimatedSwitch } from "react-router-transition";
import Initial from "../pages/Initial";
import CreateAccount from "../pages/CreateAccount";
import SelectAccount from "../pages/SelectAccount";
import SetPassword from "../pages/SetPassword";
import LogIn from "../pages/LogIn";
import { keyVault } from "../lib/keyVault";
import { accountManager } from "../lib/AccountManager";
import Authn from "../pages/services/Authn";

function AuthnRouter({ fclTabId }) {
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    async function setRoute() {
      if (keyVault.unlocked) {
        const selectedAccount = await accountManager.getFavoriteAccount();
        if (selectedAccount) {
          setInitial("/Balances");
        } else {
          setInitial("/SelectAccount");
        }
      } else {
        // if we have an account, go to Login page
        const allAccounts = await accountManager.listAccounts();
        if (allAccounts.size > 0) {
          setInitial("/LogIn");
        } else {
          setInitial("/Initial");
        }
      }
      setLoading(false);
    }
    setRoute();
  }, []);

  if (loading) {
    return null;
  }

  const entryRoutes = ["/Initial", "/LogIn", "/Balances", "/SelectAccount"];
  const initialIndex = entryRoutes.indexOf(initial) || 0;
  return (
    <MemoryRouter initialEntries={entryRoutes} initialIndex={initialIndex}>
      <AnimatedSwitch
        atEnter={{ opacity: 0.5 }}
        atLeave={{ opacity: 0.5 }}
        atActive={{ opacity: 1 }}
        className="switch-wrapper"
      >
        <Route path="/Initial" component={Initial}></Route>
        <Route path="/CreateAccount" component={CreateAccount}></Route>
        <Route path="/SelectAccount" component={SelectAccount}></Route>
        <Route path="/SetPassword" component={SetPassword}></Route>
        <Route path="/LogIn" component={LogIn}></Route>
        <Route path="/Balances">
          <Authn fclTabId={fclTabId}></Authn>
        </Route>
      </AnimatedSwitch>
    </MemoryRouter>
  );
}

export default AuthnRouter;
