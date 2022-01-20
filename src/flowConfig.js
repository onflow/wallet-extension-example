// import {config} from "@onflow/fcl"

const config = () => {}
const configs = {
    'flow_mainnet': {
        accessNode: 'https://access-mainnet-beta.onflow.org'
    },
    'flow_testnet': {
        accessNode: 'https://access-testnet.onflow.org'
    }
}

const configureFcl = (network="flow_testnet") => {
    const fclConfig = config()
    fclConfig.put('accessNode.api', configs[network].accessNode)
}

export default configureFcl
