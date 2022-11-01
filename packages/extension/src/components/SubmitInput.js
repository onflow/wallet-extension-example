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

  // Removes warning that onEnter is not a prop for Input
  var filteredProps = Object.assign({}, props);
  delete filteredProps.onEnter;

  if (props.textArea) {
    return <Textarea {...filteredProps} onKeyDown={handleKeyDown} resize="none" />;
  } else {
    return <Input {...filteredProps} onKeyDown={handleKeyDown} />;
  }
};

export default SubmitInput;
