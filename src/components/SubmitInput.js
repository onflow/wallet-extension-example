import React from "react";
import { Input, Textarea } from "@chakra-ui/react";

const SubmitInput = (props) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (props.onEnter) {
        props.onEnter();
      }
    }
  };

  if (props.textArea) {
    return <Textarea {...props} onKeyDown={handleKeyDown} resize="none" />;
  } else {
    return <Input {...props} onKeyDown={handleKeyDown} />;
  }
};

export default SubmitInput;
