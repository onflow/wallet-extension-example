import React from "react";
import { render } from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import TransactionProvider from "./contexts/TransactionContext";
import Popup from "./Popup";

import "./index.css";

// get tabId of the tab that opened the popup to establish connection with FCL
const fclTabId = Number(
  new URLSearchParams(window.location.search).get("tabId")
);

render(
  <React.StrictMode>
    <ChakraProvider>
      <TransactionProvider>
        <Popup fclTabId={fclTabId} />
      </TransactionProvider>
    </ChakraProvider>
  </React.StrictMode>,
  window.document.querySelector("#app-container")
);
