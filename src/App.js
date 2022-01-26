import React, {useState, useEffect} from "react"
import {HashRouter as Router, Switch, Route} from "react-router-dom"
import {Box} from "@chakra-ui/react"
import AuthnRouter from "./routers/AuthnRouter"
import PopupRouter from "./routers/PopupRouter"
import Authz from "./pages/services/Authz"
import {keyVault} from "./lib/keyVault"
import {loadAccounts} from "./lib/AccountManager"
import "./App.css"

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      await keyVault.loadVault()
      await loadAccounts()
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return null
  }

  return (
    <Router>
      <Box
        position='absolute'
        w={"375px"}
        h={"600px"}
        p={0}
        m={0}
        background='transparent'
      >
        <Switch>
          <Route exact path='/'>
            <PopupRouter />
          </Route>
          <Route exact path='/authn'>
            <AuthnRouter />
          </Route>
          <Route exact path='/authz'>
            <Authz />
          </Route>
        </Switch>
      </Box>
    </Router>
  )
}

export default App
