import React from "react"
import {Flex} from "@chakra-ui/react"

const PUBLISHABLE_MOONPAY_API_KEY = ``

const MoonPay = accountAddress => {
  const moonPayUrl = `https://buy-staging.moonpay.com?apiKey=${PUBLISHABLE_MOONPAY_API_KEY}&walletAddress=${accountAddress}&defaultCurrencyCode=flow`
  return (
    <Flex direction='column' grow={true}>
      <iframe
        title='moonpay'
        style={{
          height: "326px",
          width: "100vw",
          marginLeft: "-36px",
          marginTop: "-3px",
        }}
        allow='accelerometer; autoplay; camera; gyroscope; payment'
        frameBorder='0'
        src={moonPayUrl}
      >
        <p>Your browser does not support iframes.</p>
      </iframe>
    </Flex>
  )
}

export default MoonPay
