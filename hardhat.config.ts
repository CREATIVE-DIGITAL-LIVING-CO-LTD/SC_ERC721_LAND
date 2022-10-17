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
    solidity: "0.8.16",
    networks: {
        polygonMumbai: {
            url: process.env.MUMBAI_URL || "",
            accounts:
                process.env.MUMBAI_PRIVATE_KEY !== undefined
                    ? [process.env.MUMBAI_PRIVATE_KEY]
                    : [],
        },
        polygon_mainnet: {
            url: process.env.POLYGON_URL || "",
            accounts:
                process.env.POLYGON_PRIVATE_KEY !== undefined
                    ? [process.env.POLYGON_PRIVATE_KEY]
                    : [],
        },
        rinkeby: {
            url: process.env.RINKEBY_URL || "",
            accounts:
                process.env.RINKEBY_PRIVATE_KEY !== undefined
                    ? [process.env.RINKEBY_PRIVATE_KEY]
                    : [],
        },
        goerli: {
            url: process.env.GOERLI_URL || "",
            accounts:
                process.env.GOERLI_PRIVATE_KEY !== undefined
                    ? [process.env.GOERLI_PRIVATE_KEY]
                    : [],
        },
        sepolia: {
            url: process.env.SEPOLIA_URL || "",
            accounts:
                process.env.SEPOLIA_PRIVATE_KEY !== undefined
                    ? [process.env.SEPOLIA_PRIVATE_KEY]
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
            polygonMumbai: process.env.MUMBAI_POLYGONSCAN_API_KEY || "",
            rinkeby: process.env.ETHEREUM_ETHERSCAN_API_KEY || "",
        },
    },
}

export default config
