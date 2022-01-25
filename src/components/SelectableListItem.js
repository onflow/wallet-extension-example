import React from "react"
import {Text, Box} from "@chakra-ui/react"
import * as styles from "../styles"

const SelectableListItem = ({text, onClick}) => {
  return (
    <Box
      onClick={onClick}
      p='6px'
      mt='24px'
      borderColor={styles.primaryColor}
      borderRadius='xl'
      borderWidth='1px'
      bgColor={styles.secondaryColor}
      cursor='pointer'
      w='100%'
    >
      <Text fontSize='lg' m='auto' p='8px' ml='12px' fontWeight='semibold'>
        {text}
      </Text>
    </Box>
  )
}

export default SelectableListItem
