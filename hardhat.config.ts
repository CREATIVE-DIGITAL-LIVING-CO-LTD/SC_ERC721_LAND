import * as dotenv from "dotenv"

import { HardhatUserConfig } from "hardhat/config"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import "hardhat-gas-reporter"
import "solidity-coverage"

require("solidity-coverage")

// eslint-disable-next-line node/no-path-concat
dotenv.config({ path: __dirname + "/.env" })

const config: HardhatUserConfig = {
    solidity: "0.8.15",
    networks: {
        polygonMumbai: {
            url: process.env.POLYGON_TESTNET_URL || "",
            accounts:
                process.env.PRIVATE_KEY_TESTNET !== undefined
                    ? [process.env.PRIVATE_KEY_TESTNET]
                    : [],
        },
        polygon_mainnet: {
            url: process.env.POLYGON_MAINNET_URL || "",
            accounts:
                process.env.PRIVATE_KEY_MAINNET !== undefined
                    ? [process.env.PRIVATE_KEY_MAINNET]
                    : [],
        },
        rinkeby: {
            url: process.env.RINKEBY_URL || "",
            accounts:
                process.env.PRIVATE_KEY_RINKEBY !== undefined
                    ? [process.env.PRIVATE_KEY_RINKEBY]
                    : [],
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "THB",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: "MATIC",
    },
    etherscan: {
        apiKey: {
            polygonMumbai: process.env.POLYGONSCAN_TESTNET_API_KEY || "",
        },
    },
}

export default config
