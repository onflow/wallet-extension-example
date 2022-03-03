import React from "react";
import { render } from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import TransactionProvider from "./contexts/TransactionContext";
import Popup from "./Popup";

import "./index.css";

render(
  <React.StrictMode>
    <ChakraProvider>
      <TransactionProvider>
        <Popup />
      </TransactionProvider>
    </ChakraProvider>
  </React.StrictMode>,
  window.document.querySelector("#app-container")
);
