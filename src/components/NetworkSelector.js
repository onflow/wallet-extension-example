import React from "react"
import {Select} from "@chakra-ui/react"
import {
  switchManager,
  availableManagers,
  accountManager,
} from "../lib/AccountManager"
import * as styles from "../styles"

// build the list of networks to choose from
function selectOptions() {
  let options = []
  for (let i = 0; i < availableManagers.length; i++) {
    let selected = accountManager == availableManagers[i]
    options.push(
      <option
        selected={selected}
        value={availableManagers[i].accountStoragePrefix}
      >
        {availableManagers[i].accountNetwork}
      </option>
    )
  }
  return options
}

const NetworkSelector = ({onChange}) => {
  return (
    <Select
      onChange={res => {
        switchManager(res.target.value)
        onChange()
      }}
      p='6px'
      mt='24px'
      borderColor={styles.primaryColor}
      borderRadius='xl'
      borderWidth='1px'
      bgColor={styles.secondaryColor}
      cursor='pointer'
      w='100%'
    >
      {selectOptions()}
    </Select>
  )
}

export default NetworkSelector
